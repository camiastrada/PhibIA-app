import { useState, useRef } from "react";
import { Link } from "react-router-dom";

import "../styles/App.css";
import ResultPanel from "../components/ui/ResultPanel";
import Upload from "../components/Upload";
import TitleWithSubtitle from "../components/ui/TitleWithSubtitle";
import StopRecordIcon from "../assets/uiIcons/stopRecordIcon";
import MicrophoneIcon from "../assets/uiIcons/microphoneIcon";
import UploadIcon from "../assets/uiIcons/uploadIcon";
import InfoIcon from "../assets/uiIcons/infoIcon";
import BackIcon from "../assets/uiIcons/backIcon";


function Home() {
  const [listening, setListening] = useState(false);
  const [isImport, setIsImport] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const API_URL = import.meta.env.VITE_API_URL ?? "/api";

  const [isProcessing, setIsProcessing] = useState(false);
  const [listeningFile, setListeningFile] = useState(false);
  const [predictedSpecies, setPredictedSpecies] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [commonName, setCommonName] = useState<string | null>(null);
  const [_description, setDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [_locationError, setLocationError] = useState<string | null>(null);
  const [_isGettingLocation, setIsGettingLocation] = useState(false);

  const specieNumber = predictedSpecies?.split("-")[0];
  const specieName = predictedSpecies?.split("-")[1];

  const hasPrediction = Boolean(
    !listening &&
      !isProcessing &&
      !error &&
      predictedSpecies &&
      predictedSpecies !== "No detectada"
  );

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no soportada"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 segundos
        maximumAge: 0, // No usar posición cacheada
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lng: longitude });
        },
        (error) => {
          let errorMessage = "Error obteniendo ubicación: ";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Permiso denegado por el usuario";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Ubicación no disponible";
              break;
            case error.TIMEOUT:
              errorMessage += "Tiempo de espera agotado";
              break;
            default:
              errorMessage += error.message;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  const cancelProcessing = () => {
    // Abortar la petición fetch si está en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Limpiar estados
    setIsProcessing(false);
    setError(null);
    chunksRef.current = [];
  };

  const resetState = () => {
    // Cancelar procesamiento si está activo
    if (isProcessing) {
      cancelProcessing();
    }
    
    // Detener grabación si está activa
    if (listening && mediaRecorderRef.current) {
      stopRecording();
    } else {
      // Si no hay recorder activo, solo limpiar
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }

    // Limpiar todos los estados
    setListening(false);
    setListeningFile(false);
    setIsImport(false);
    setIsProcessing(false);
    setPredictedSpecies(null);
    setConfidence(null);
    setCommonName(null);
    setDescription(null);
    setError(null);
    setUserLocation(null);
    setLocationError(null);
    setIsGettingLocation(false);
    setFile(null);

    // Limpiar referencias
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    abortControllerRef.current = null;
  };

  // Iniciar grabación
  const startRecording = async () => {
    setError(null);
    setPredictedSpecies(null);
    setConfidence(null);
    setLocationError(null);
    setUserLocation(null);

    try {
      // Primero solicitar permisos del micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      // Una vez que tenemos el micrófono, obtener ubicación en paralelo
      setIsGettingLocation(true);
      getCurrentLocation()
        .then((location) => {
          setUserLocation(location);
        })
        .catch((locationErr: any) => {
          setLocationError(locationErr.message);
          // No detenemos la grabación si falla la ubicación
        })
        .finally(() => {
          setIsGettingLocation(false);
        });

      const options: any = {};

      const recorder = new MediaRecorder(stream as MediaStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Cerrar el micrófono INMEDIATAMENTE
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => {
            t.stop();
          });
          streamRef.current = null;
        }
        
        setListening(false); // Desactivar el estado de escucha
        
        try {
          setIsProcessing(true);
          const mime = chunksRef.current[0]?.type || "audio/webm";
          const ext = mime.includes("webm")
            ? "webm"
            : mime.includes("wav")
            ? "wav"
            : "audio";
          const blob = new Blob(chunksRef.current, { type: mime });

          // preparar FormData con la clave que el backend espera: 'audio'
          const formData = new FormData();
          formData.append("audio", blob, `recording_${Date.now()}.${ext}`);

          if (userLocation) {
            formData.append("latitude", userLocation.lat.toString());
            formData.append("longitude", userLocation.lng.toString());
          }

          // Crear AbortController para poder cancelar
          abortControllerRef.current = new AbortController();

          // enviar al backend
          const res = await fetch(`${API_URL}/predict`, {
            method: "POST",
            credentials: "include",
            body: formData,
            signal: abortControllerRef.current.signal,
          });

          const data = await res.json().catch(() => null);
          if (!res.ok) {
            setError(
              (data && data.error) || `Error del servidor: ${res.status}`
            );
          } else {
            // backend devuelve { prediccion, confianza, especie_info }
            setPredictedSpecies(
              data?.prediccion ??
                data?.prediction ??
                data?.species ??
                "No detectada"
            );
            setConfidence(data?.confianza ?? null);
            setCommonName(data?.especie_info?.nombre_comun ?? null);
            setDescription(data?.especie_info?.descripcion ?? null);
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            setError(null); // No mostrar error si fue cancelado
          } else {
            setError(err?.message || String(err));
          }
        } finally {
          setIsProcessing(false);
          mediaRecorderRef.current = null;
          chunksRef.current = [];
          abortControllerRef.current = null;
        }
      };

      recorder.start();
      setListening(true); // Solo aquí se activa listening
    } catch (err: any) {
      // Limpiar stream si hay error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      
      // Manejar diferentes tipos de errores
      let errorMessage = "No se pudo acceder al micrófono: ";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage += "Permiso denegado. Por favor, permite el acceso al micrófono en la configuración de tu navegador.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No se encontró ningún micrófono conectado.";
      } else if (err.name === "NotReadableError") {
        errorMessage += "El micrófono está siendo usado por otra aplicación.";
      } else {
        errorMessage += (err?.message || err);
      }
      
      setError(errorMessage);
      setIsGettingLocation(false);
      setListening(false); // Asegurar que listening esté en false
      mediaRecorderRef.current = null;
    }
  };

  // Detener grabación
  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    
    if (!recorder) {
      // Si no hay recorder, limpiar stream y estado
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
      setListening(false);
      return;
    }

    // Solo detener si está grabando
    if (recorder.state === "recording") {
      recorder.stop();
      // El stream se cierra en el handler onstop
    } else {
      // Si ya está detenido, limpiar manualmente
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
      mediaRecorderRef.current = null;
      setListening(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setPredictedSpecies(null);
      setConfidence(null);
      setLocationError(null);
      setUserLocation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImport(false);
    
    if (!file) {
      setError("Por favor selecciona un archivo de audio");
      return;
    }
    
    setListeningFile(true);
    // Obtener ubicación actual para archivos subidos también
    let currentLocation = null;
    setIsGettingLocation(true);
    try {
      currentLocation = await getCurrentLocation();
      setUserLocation(currentLocation);
    } catch (locationErr: any) {
      setLocationError(locationErr.message);
    } finally {
      setIsGettingLocation(false);
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("audio", file);

    // Agregar ubicación si está disponible
    if (currentLocation) {
      formData.append("latitude", currentLocation.lat.toString());
      formData.append("longitude", currentLocation.lng.toString());
    }

    // Crear AbortController para poder cancelar
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        credentials: "include",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (response.ok) {
        setPredictedSpecies(data.prediccion);
        setConfidence(data.confianza ?? null);
        setCommonName(data?.especie_info?.nombre_comun ?? null);
        setDescription(data?.especie_info?.descripcion ?? null);
        setError(null);
      } else {
        setError(data.error || "Error en la predicción");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError(null); // No mostrar error si fue cancelado
      } else {
        setError("Error al conectar con el servidor");
      }
    } finally {
      setIsProcessing(false);
      setListeningFile(false);
      setFile(null);
      abortControllerRef.current = null;
    }
  };

  return (
    <>
    <div
      className={
        isImport
          ? "absolute flex w-auto justify-center items-center z-10"
          : "hidden"
      }
    >
      <Upload
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        setIsImport={setIsImport}
      />
    </div>
    <div
      className="flex flex-col justify-center items-center w-full md:w-4/5 h-auto min-h-3/5 md:min-h-4/5 bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4"
    >
      <div id="content" className={`${isImport ? "blur-xl" : ""} w-full h-full flex flex-col items-center justify-center`}>
        <TitleWithSubtitle
          title={hasPrediction ? specieName : "¡Comienza a grabar!"}
          subtitle={
            hasPrediction
              ? commonName || "Nombre común no disponible"
              : "Acercate al anfibio y graba su canto para detectar su especie"
          }
        />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-6 my-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#004D40]"></div>
            <p className="text-lg text-[#004D40] font-semibold">
              Analizando audio...
            </p>
            <p className="text-sm text-gray-600">
              Esto puede tomar unos segundos
            </p>
          </div>
        ) : (
          <>
            <ResultPanel
              listening={listening}
              prediction={hasPrediction|| listeningFile}
              specie={specieNumber}
              confidence={confidence}
            />
          </>
        )}
        {hasPrediction && (
          <>
            <div className="flex flex-col items-center gap-6">
              <Link
                to={"/encyclopedia/" + specieName}
                className="text-[#004D40] hover:text-[#02372E] flex gap-1"
              >
                <InfoIcon />
                ver informacion detallada
              </Link>

              {userLocation && (
                <Link
                  to={`/frogs-map?lat=${userLocation.lat}&lng=${userLocation.lng}`}
                  className="flex bg-[#1976D2] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#1565C0] text-white w-50 md:w-60 px-6 py-3 text-lg font-semibold items-center justify-center gap-1"
                >
                  Ver en mapa
                </Link>
              )}

              <button
                type="button"
                onClick={resetState}
                className="flex bg-[#43A047] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#357a38] text-white w-50 md:w-60 px-6 py-3 text-lg font-semibold items-center justify-center gap-1"
              >
                Volver
                <BackIcon className="size-5" />
              </button>
            </div>
          </>
        )}

        <div
          id="buttonsSection"
          className={`${
            hasPrediction ? "hidden" : "flex"
          } flex-col justify-around items-center`}
        >
          {isProcessing ? (
            <button
              type="button"
              onClick={cancelProcessing}
              className="flex bg-red-600 rounded-xl shadow-lg hover:shadow-xl hover:bg-red-700 text-white w-50 md:w-60 px-6 py-3 text-lg font-semibold items-center justify-center gap-1"
            >
              Cancelar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  listening ? stopRecording() : startRecording();
                  setIsImport(false);
                }}
                className={`flex flex-row justify-center cursor-pointer ${
                  listening
                    ? "bg-transparent text-red-600 animate-pulse"
                    : "bg-[#43A047] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#357a38] text-white w-50 md:w-60 px-6 py-3 text-lg font-semibold items-center justify-center gap-1"
                }`}
              >
                {listening ? (
                  <>
                    <StopRecordIcon className="size-15" />
                  </>
                ) : (
                  <>
                    <p>Grabar</p>
                    <MicrophoneIcon className="size-6" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsImport(true);
                  setListening(false);
                }}
                className={`mt-4 text-[#004D40] hover:text-[#02372E] flex-row justify-center items-center gap-1 cursor-pointer ${
                  listening || listeningFile ? "hidden" : "flex"
                }`}
              >
                Importar grabación
                <UploadIcon className="size-4 inline-block" />
              </button>
            </>
          )}
          
        </div>
        {/* mostrar error */}
        <div className="mt-4 text-center">
          {error && <p className="text-red-600">Error: {error}</p>}
        </div>
      </div>
    </div>
    </>
  );
}

export default Home;
