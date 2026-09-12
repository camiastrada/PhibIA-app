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
import RanaToroCard from "../components/RanaToroCard";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYWdvc3JvZHJpZ3VleiIsImEiOiJjbWhjeWRmcHcwZ2Y4MmxwdHRxa2x2Zm15In0.9cwGVix-S-zFHfXSs1DgBw";

function Home() {
  const [listening, setListening] = useState(false);
  const [isImport, setIsImport] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  const API_URL = import.meta.env.VITE_API_URL ?? "/api";

  const [isProcessing, setIsProcessing] = useState(false);
  const [listeningFile, setListeningFile] = useState(false);
  const [predictedSpecies, setPredictedSpecies] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [commonName, setCommonName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [manualLocation, setManualLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const specieNumber = predictedSpecies?.split("-")[0];
  const specieName = predictedSpecies?.split("-")[1];
  const hasPrediction = Boolean(
    !listening &&
      !isProcessing &&
      !error &&
      predictedSpecies &&
      predictedSpecies !== "No detectada"
  );

  // Función para obtener la descripción de ubicación desde Mapbox
  const getLocationDescription = async (lng: number, lat: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es`
      );
      
      if (!response.ok) {
        return "Ubicación del usuario";
      }
      
      const data = await response.json();
      const features = data.features || [];
      
      if (features.length === 0) {
        return "Ubicación del usuario";
      }
      
      // Buscar la ciudad o lugar más relevante
      const place = features.find((f: any) => 
        f.place_type.includes('place') || f.place_type.includes('locality')
      );
      
      if (place) {
        return place.text || "Ubicación del usuario";
      }
      
      // Si no hay ciudad, usar el primer resultado
      return features[0]?.text || "Ubicación del usuario";
    } catch (error) {
      console.error("Error al obtener descripción de ubicación:", error);
      return "Ubicación del usuario";
    }
  };

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation)
        return reject(new Error("Geolocalización no soportada"));

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          let msg = "Error obteniendo ubicación: ";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              msg += "Permiso denegado";
              break;
            case err.POSITION_UNAVAILABLE:
              msg += "Ubicación no disponible";
              break;
            case err.TIMEOUT:
              msg += "Tiempo de espera agotado";
              break;
            default:
              msg += err.message;
          }
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

  const resetState = () => {
    if (isProcessing && abortControllerRef.current)
      abortControllerRef.current.abort();
    if (listening && mediaRecorderRef.current) stopRecording();
    else if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setListening(false);
    setListeningFile(false);
    setIsImport(false);
    setIsProcessing(false);
    setPredictedSpecies(null);
    setConfidence(null);
    setCommonName(null);
    setError(null);
    setUserLocation(null);
    setManualLocation(null);
    setFile(null);

    mediaRecorderRef.current = null;
    chunksRef.current = [];
    abortControllerRef.current = null;
  };

  const startRecording = async () => {
    setError(null);
    setPredictedSpecies(null);
    setConfidence(null);
    setUserLocation(null);
    userLocationRef.current = null;

  
    try {
      const loc = await getCurrentLocation();
      setUserLocation(loc);
      userLocationRef.current = loc; 
    } catch (err: any) {
      console.warn("No se pudo obtener ubicación:", err.message);
      // Continuar sin ubicación
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        setListening(false);

        try {
          setIsProcessing(true);
          const mime = chunksRef.current[0]?.type || "audio/webm";
          const ext = mime.includes("webm")
            ? "webm"
            : mime.includes("wav")
            ? "wav"
            : "audio";
          const blob = new Blob(chunksRef.current, { type: mime });

          const formData = new FormData();
          formData.append("audio", blob, `recording_${Date.now()}.${ext}`);

          // Solo enviar ubicación si existe
          if (userLocationRef.current) {
            formData.append("latitud", userLocationRef.current.lat.toString());
            formData.append("longitud", userLocationRef.current.lng.toString());
            
            // Obtener descripción de ubicación
            const descripcion = await getLocationDescription(userLocationRef.current.lng, userLocationRef.current.lat);
            formData.append("descripcion", descripcion);
          }

          abortControllerRef.current = new AbortController();
          const res = await fetch(`${API_URL}/predict`, {
            method: "POST",
            credentials: "include",
            body: formData,
            signal: abortControllerRef.current.signal,
          });

          const data = await res.json().catch(() => null);
          if (!res.ok)
            setError(data?.error || `Error del servidor: ${res.status}`);
          else {
            setPredictedSpecies(data?.prediccion ?? "No detectada");
            setConfidence(data?.confianza ?? null);
            setCommonName(data?.especie_info?.nombre_comun ?? null);
          }
        } catch (err: any) {
          if (err.name !== "AbortError") setError(err?.message || String(err));
        } finally {
          setIsProcessing(false);
          mediaRecorderRef.current = null;
          chunksRef.current = [];
          abortControllerRef.current = null;
        }
      };

      recorder.start();
      setListening(true);
    } catch (err: any) {
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      let msg = "No se pudo acceder al micrófono: ";
      if (err.name === "NotAllowedError") msg += "Permiso denegado";
      else if (err.name === "NotFoundError") msg += "No se encontró micrófono";
      else msg += err?.message || err;
      setError(msg);
      setListening(false);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setListening(false);
      return;
    }
    if (recorder.state === "recording") recorder.stop();
    else {
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
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

      // setShowMiniMap(true);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImport(false);
    
    if (!file) return setError("Selecciona un archivo de audio");

    setListeningFile(true);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("audio", file);

    // Solo enviar ubicación si fue seleccionada manualmente
    if (manualLocation) {
      formData.append("latitud", manualLocation.lat.toString());
      formData.append("longitud", manualLocation.lng.toString());
      
      // Obtener descripción de ubicación
      const descripcion = await getLocationDescription(manualLocation.lng, manualLocation.lat);
      formData.append("descripcion", descripcion);
    }

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
        setError(null);
      } else setError(data.error || "Error en la predicción");
    } catch (err: any) {
      if (err.name !== "AbortError")
        setError("Error al conectar con el servidor");
    } finally {
      setIsProcessing(false);
      setListeningFile(false);
      setFile(null);
      abortControllerRef.current = null;
    }
  };

  return (
    <>
      {isImport && (
        <div className="absolute flex w-auto flex-col justify-center items-center z-10 max-w-full overflow-hidden">
          <Upload
            handleFileChange={handleFileChange}
            handleImportSubmit={handleImportSubmit}
            setIsImport={setIsImport}
            setManualLocation={setManualLocation}
          />
        </div>
      )}
      <div className="flex-1 min-h-0 h-full px-3 md:px-4 py-4 md:py-8 bg-[...] bg-cover bg-center overflow-hidden flex justify-center items-center">
        <div className={`flex flex-row justify-center items-center w-full h-full max-w-6xl bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4 ${isImport ? "blur-xs" : ""}`}>

          {/*apartado de grabar audios*/}
          <div className="w-full h-full flex flex-col items-center justify-center">
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
              <ResultPanel
                listening={listening}
                prediction={hasPrediction || listeningFile}
                specie={specieNumber}
                confidence={confidence}
              />
            )}

            {/* Botones grabar/importar */}
            {!hasPrediction && (
              <div className="flex flex-col justify-around items-center mt-4">
                  <button
                    type="button"
                    disabled = {isImport}
                    onClick={() => {
                      listening ? stopRecording() : startRecording();
                      setIsImport(false);
                    }}
                    className={`flex flex-row justify-center ${
                      listening
                        ? "bg-transparent text-red-600 animate-pulse"
                        : isImport
                        ? "bg-[#43A047] rounded-xl shadow-lg text-white w-full max-w-50 md:max-w-60 px-6 py-3 text-lg font-semibold items-center justify-center gap-1"
                        : "bg-[#43A047] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#357a38] text-white w-full max-w-50 md:max-w-60 px-6 py-3 text-lg font-semibold items-center justify-center gap-1"
                    }
                    ${isImport ? "" : "cursor-pointer"}`}
                  >
                    {listening ? (
                      <StopRecordIcon className="size-15" />
                    ) : (
                      <>
                        <p>Grabar</p>
                        <MicrophoneIcon className="size-6" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled = {isImport}
                    onClick={() => {
                      setIsImport(true);
                      setListening(false);
                      setUserLocation(null);
                      setPredictedSpecies(null);
                      setConfidence(null);
                    }}
                    className={`mt-4 text-[#004D40] flex-row justify-center items-center gap-1  ${isImport ? "" : "hover:text-[#02372E] cursor-pointer"}`}
                  >
                    Importar grabación
                    <UploadIcon className="size-4 inline-block" />
                  </button>
              </div>
            )}

            

            {hasPrediction && (
              <div className="flex flex-col items-center gap-4 mt-4">
                <Link
                  to={"/encyclopedia/" + specieName}
                  className="text-[#004D40] hover:text-[#02372E] flex gap-1"
                >
                  <InfoIcon />
                  Ver información detallada
                </Link>

                {(userLocation || manualLocation) && (
                  <Link
                    to={`/map?lat=${(userLocation || manualLocation)?.lat}&lng=${
                      (userLocation || manualLocation)?.lng
                    }&especie=${encodeURIComponent(commonName || "")}`} // ✅ USA commonName
                    className="flex bg-[#43A047] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#1565C0] text-white w-full max-w-50 md:max-w-60 px-6 py-3 text-lg font-semibold items-center justify-center gap-1"
                  >
                    Ver en mapa
                  </Link>
                )}

                <button
                  type="button"
                  onClick={resetState}
                  className="flex bg-[#43A047] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#357a38] text-white w-full max-w-50 md:max-w-60 px-6 py-3 text-lg font-semibold items-center justify-center gap-1"
                >
                  Volver
                  <BackIcon className="size-5" />
                </button>
              </div>
            )}

            {error && (
              <p className="mt-4 text-red-600 text-center">Error: {error}</p>
            )}
          </div>

          {/* apartado de la rana toro */}
          <RanaToroCard />
        </div>
      </div>
    </>
  );
}

export default Home;
