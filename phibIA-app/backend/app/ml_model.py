import pickle
import numpy as np
import librosa
import os
import subprocess
from scipy.ndimage import zoom
import tensorflow as tf
from tensorflow import keras

# Variables globales para el modelo
model = None
label_encoder = None
species_names = None

# Parámetros de preprocesamiento (se cargarán del metadata)
SAMPLE_RATE = None
N_FFT = None
HOP_LENGTH = None
N_MELS = None
DURATION = None
IMG_HEIGHT = None
IMG_WIDTH = None

# Rutas de archivos
MODEL_PATH = "app/model/cnn_por_individuo.h5"
METADATA_PATH = "app/model/cnn_por_individuo_metadata.pkl"


def load_model():
    """
    Carga el modelo CNN y sus metadatos.
    Debe llamarse al iniciar la aplicación para evitar delays en la primera predicción.
    """
    global model, label_encoder, species_names
    global SAMPLE_RATE, N_FFT, HOP_LENGTH, N_MELS, DURATION, IMG_HEIGHT, IMG_WIDTH
    
    print(f"🔄 Cargando modelo CNN desde {MODEL_PATH}...")
    
    # Cargar modelo CNN
    model = keras.models.load_model(MODEL_PATH)
    print("✅ Modelo CNN cargado exitosamente")
    
    # Cargar metadata
    with open(METADATA_PATH, "rb") as f:
        metadata = pickle.load(f)
    
    label_encoder = metadata["label_encoder"]
    species_names = metadata["species_names"]
    
    # Parámetros de preprocesamiento
    SAMPLE_RATE = metadata["sample_rate"]
    N_FFT = metadata["n_fft"]
    HOP_LENGTH = metadata["hop_length"]
    N_MELS = metadata["n_mels"]
    DURATION = metadata["duration"]
    IMG_HEIGHT = metadata["img_height"]
    IMG_WIDTH = metadata["img_width"]
    
    print(f"📊 Parámetros: SR={SAMPLE_RATE}, N_MELS={N_MELS}, IMG={IMG_HEIGHT}x{IMG_WIDTH}")
    
    # Hacer warmup completo para eliminar delays en la primera predicción
    print("🔥 Precalentando modelo y librerías (warmup)...")
    
    # 1. Warmup de TensorFlow - predicción dummy
    dummy_input = np.random.rand(1, IMG_HEIGHT, IMG_WIDTH, 1).astype(np.float32)
    _ = model.predict(dummy_input, verbose=0)
    
    # 2. Warmup de librosa - generar espectrograma dummy
    # Esto precarga todas las funciones de librosa que se usan en audio_to_melspectrogram
    dummy_audio = np.random.randn(int(SAMPLE_RATE * DURATION)).astype(np.float32)
    _ = librosa.feature.melspectrogram(
        y=dummy_audio, 
        sr=SAMPLE_RATE, 
        n_fft=N_FFT, 
        hop_length=HOP_LENGTH, 
        n_mels=N_MELS
    )
    
    print("✅ Modelo y librerías precalentados - listo para predicciones rápidas")
    
    return model


def audio_to_melspectrogram(audio, sr=SAMPLE_RATE):
    """
    Genera espectrograma Mel normalizado para el modelo CNN
    """
    # Ajustar duración
    target_length = int(SAMPLE_RATE * DURATION)
    if len(audio) < target_length:
        audio = np.pad(audio, (0, target_length - len(audio)))
    else:
        audio = audio[:target_length]

    # Generar espectrograma Mel
    mel_spec = librosa.feature.melspectrogram(
        y=audio, sr=sr, n_fft=N_FFT, hop_length=HOP_LENGTH, n_mels=N_MELS
    )

    # Convertir a dB y normalizar
    mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
    mel_spec_norm = (mel_spec_db - mel_spec_db.min()) / (mel_spec_db.max() - mel_spec_db.min())

    # Redimensionar si es necesario
    if mel_spec_norm.shape != (IMG_HEIGHT, IMG_WIDTH):
        zoom_factors = (IMG_HEIGHT / mel_spec_norm.shape[0],
                       IMG_WIDTH / mel_spec_norm.shape[1])
        mel_spec_norm = zoom(mel_spec_norm, zoom_factors)

    return mel_spec_norm


def predict_species(file_path):
    """
    Predice la especie de anfibio a partir de un archivo de audio
    Retorna: (especie, confidence)
    - especie: formato "{especie_id}-{nombre_cientifico}"
    - confidence: porcentaje de confianza (0-100)
    """
    try:
        # Verificar si el archivo es .webm y convertir
        if file_path.endswith('.webm'):
            wav_path = file_path.replace('.webm', '.wav')
            file_path = convert_webm_to_wav(file_path, wav_path)
            if not file_path:
                raise ValueError("Error en la conversión de .webm a .wav")
        
        # Cargar audio
        audio, sr = librosa.load(file_path, sr=SAMPLE_RATE)
        
        # Generar espectrograma Mel
        mel_spec = audio_to_melspectrogram(audio, sr)
        
        # Preparar para el modelo (agregar dimensiones de batch y canal)
        X = mel_spec[np.newaxis, ..., np.newaxis]  # Shape: (1, 128, 216, 1)
        
        # Predicción
        predictions = model.predict(X, verbose=0)
        
        # Obtener clase predicha y confianza
        pred_class = np.argmax(predictions[0])
        confidence = float(predictions[0][pred_class]) * 100  # Convertir a porcentaje
        
        # Obtener nombre de especie
        nombre_cientifico = species_names[pred_class]
        
        # Extraer especie_id del nombre científico
        # El nombre puede venir en diferentes formatos:
        # 1. "ID-NombreCientifico" (ej: "1-Boana_riojana")
        # 2. "NombreCientifico" (ej: "Boana_riojana")
        
        especie_id = None
        
        # Intentar extraer ID del nombre
        if '-' in nombre_cientifico:
            # Formato: "ID-NombreCientifico"
            parts = nombre_cientifico.split('-', 1)
            try:
                especie_id = int(parts[0])
                nombre_cientifico = parts[1]
            except ValueError:
                pass
        
        # Si no se pudo extraer el ID, usar el índice + 1 como fallback
        # NOTA: Esto asume que las especies están ordenadas por ID en la base de datos
        # Si tu base de datos tiene un orden diferente, necesitarás ajustar esto
        if especie_id is None:
            especie_id = pred_class + 1
            print(f"⚠️ No se pudo extraer especie_id del nombre '{nombre_cientifico}', usando índice+1: {especie_id}")
        
        # Formatear respuesta en el formato esperado
        especie = f"{especie_id}-{nombre_cientifico}"
        
        return especie, confidence

    except Exception as e:
        print(f"Error procesando {file_path}: {str(e)}")
        raise ValueError(f"No se pudo procesar el audio: {str(e)}")


def convert_webm_to_wav(input_path, output_path):
    """
    Convierte archivo .webm a .wav usando FFmpeg
    """
    try:
        command = ['ffmpeg', '-i', input_path, output_path, '-y']
        subprocess.run(command, check=True, capture_output=True)
        return output_path
    except Exception as e:
        print(f"Error al convertir {input_path} a .wav: {e}")
        return None