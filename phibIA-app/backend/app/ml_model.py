import pickle
import numpy as np
import librosa
import os
import subprocess

# CARGAR MODELO
MODEL_PATH = "app/model/anfibios_model_mejorado.pkl"

with open(MODEL_PATH, "rb") as f:
    model_data = pickle.load(f)

model = model_data["model"]
scaler = model_data["scaler"]
label_encoder = model_data["label_encoder"]

N_MFCC = model_data["n_mfcc"]
N_FFT = model_data["n_fft"]
HOP_LENGTH = model_data["hop_length"]

# FUNCIÓN PARA EXTRAER FEATURES 
def extract_features(file_path):
    try:
        # Verificar si el archivo es .webm
        if file_path.endswith('.webm'):
            wav_path = file_path.replace('.webm', '.wav')
            file_path = convert_webm_to_wav(file_path, wav_path)
            if not file_path:
                print("Error en la conversión de .webm a .wav")
                return None
            
        audio, sr = librosa.load(file_path, sr=None)

        # 1. MFCC
        mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=N_MFCC, n_fft=N_FFT, hop_length=HOP_LENGTH)
        mfcc_mean = np.mean(mfccs, axis=1)
        mfcc_std = np.std(mfccs, axis=1)

        # 2. Spectral Centroid
        spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=sr, n_fft=N_FFT, hop_length=HOP_LENGTH)[0]
        spectral_centroid_mean = np.mean(spectral_centroids)
        spectral_centroid_std = np.std(spectral_centroids)

        # 3. Spectral Rolloff
        spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sr, n_fft=N_FFT, hop_length=HOP_LENGTH)[0]
        spectral_rolloff_mean = np.mean(spectral_rolloff)
        spectral_rolloff_std = np.std(spectral_rolloff)

        # 4. Zero Crossing Rate
        zcr = librosa.feature.zero_crossing_rate(y=audio, frame_length=N_FFT, hop_length=HOP_LENGTH)[0]
        zcr_mean = np.mean(zcr)
        zcr_std = np.std(zcr)

        # 5. Chroma
        chroma = librosa.feature.chroma_stft(y=audio, sr=sr, n_fft=N_FFT, hop_length=HOP_LENGTH)
        chroma_mean = np.mean(chroma, axis=1)
        chroma_std = np.std(chroma, axis=1)

        # 6. Spectral Contrast
        spectral_contrast = librosa.feature.spectral_contrast(y=audio, sr=sr, n_fft=N_FFT, hop_length=HOP_LENGTH)
        spectral_contrast_mean = np.mean(spectral_contrast, axis=1)
        spectral_contrast_std = np.std(spectral_contrast, axis=1)

        # Combinar todas las características
        features = np.concatenate([
            mfcc_mean, mfcc_std,
            [spectral_centroid_mean, spectral_centroid_std],
            [spectral_rolloff_mean, spectral_rolloff_std],
            [zcr_mean, zcr_std],
            chroma_mean, chroma_std,
            spectral_contrast_mean, spectral_contrast_std
        ])

        return features

    except Exception as e:
        print(f"Error procesando {file_path}: {str(e)}")
        return None

# FUNCIÓN DE PREDICCIÓN
def predict_species(file_path):
    features = extract_features(file_path)
    if features is None:
        raise ValueError("No se pudieron extraer características del audio.")

    # Reescalar igual que en el entrenamiento
    X_scaled = scaler.transform([features])

    # Predicción del modelo
    pred_encoded = model.predict(X_scaled)[0]
    
    # Obtener probabilidades de todas las clases
    probabilities = model.predict_proba(X_scaled)[0]
    
    # La confianza es la probabilidad máxima (de la clase predicha)
    confidence = float(max(probabilities)) * 100  # Convertir a porcentaje

    # Decodificar nombre de especie
    especie = label_encoder.inverse_transform([pred_encoded])[0]
    
    return especie, confidence

def convert_webm_to_wav(input_path, output_path):
    try:
        # Comando FFmpeg para convertir .webm a .wav
        command = ['ffmpeg', '-i', input_path, output_path, '-y']
        subprocess.run(command, check=True)
        return output_path
    except Exception as e:
        print(f"Error al convertir {input_path} a .wav: {e}")
        return None