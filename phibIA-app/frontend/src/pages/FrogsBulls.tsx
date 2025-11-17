import { useState, useRef, useEffect } from "react";
import "../styles/App.css";
import TitleWithSubtitle from "../components/ui/TitleWithSubtitle";
import BackIcon from "../assets/uiIcons/backIcon";

export default function FrogsBulls() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isCameraOn && videoRef.current) {
      const video = videoRef.current;
      const handleCanPlay = () => {
        video.play().catch((e) => console.error("Error al reproducir:", e));
      };

      video.addEventListener("canplay", handleCanPlay);

      return () => {
        video.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [isCameraOn]);

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no soportada"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          let errorMsg = "Error obteniendo ubicación: ";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg += "Permiso denegado";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg += "Ubicación no disponible";
              break;
            case err.TIMEOUT:
              errorMsg += "Tiempo de espera agotado";
              break;
            default:
              errorMsg += err.message;
          }
          reject(new Error(errorMsg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const startCamera = async () => {
    try {
      setIsGettingLocation(true);
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error: any) {
        console.error("Error de ubicación:", error.message);
        alert(
          `No se pudo obtener la ubicación: ${error.message}. Puedes continuar sin ubicación.`
        );
        setUserLocation(null);
      } finally {
        setIsGettingLocation(false);
      }

      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setIsCameraOn(true);
              })
              .catch((e) => {
                console.error("Error al reproducir video:", e);
              });
          }
        }, 100);
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      alert(
        "No se pudo acceder a la cámara. Por favor, permite los permisos de cámara."
      );
      setIsGettingLocation(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video no disponibles");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      console.error("No se pudo obtener el contexto 2D");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPhoto(dataUrl);

    stopCamera();
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const savePhoto = async () => {
    if (!photo) return;
    setIsSaving(true);
    try {
      const response = await fetch(photo);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("image", blob, `frog_${Date.now()}.jpeg`);

      if (userLocation) {
        formData.append("lat", userLocation.lat.toString());
        formData.append("lng", userLocation.lng.toString());
      }

      const API_URL = import.meta.env.VITE_API_URL ?? "/api";
      const res = await fetch(`${API_URL}/save-photo`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error al guardar la foto:", errorData);
        alert(
          `Error al guardar la foto: ${errorData.error || "Error desconocido"}`
        );
      } else {
        const result = await res.json();
        console.log("✅ Foto guardada:", result);
        alert("Foto guardada con éxito");
        setPhoto(null);
        setUserLocation(null);
      }
    } catch (err) {
      console.error("Error al guardar la foto", err);
      alert("Error al guardar la foto. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-3xl h-auto my-4 md:my-0 max-h-[calc(100vh-8rem)] md:max-h-[85vh] overflow-y-auto bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-3 md:p-5">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <TitleWithSubtitle
          title={"¡Comienza a capturar!"}
          subtitle={
            "Acercate a la rana toro y toma una foto para notificar su ubicación"
          }
        />

        {!photo ? (
          <div className="flex flex-col items-center gap-3 mt-3">
            <div className={`relative ${isCameraOn ? "block" : "hidden"}`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="border-4 border-white-500 rounded-lg w-72 h-52 md:w-80 md:h-60 bg-white object-cover"
              />
            </div>

            {!isCameraOn && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg w-72 h-52 md:w-80 md:h-60 flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2"></div>
                  <p className="text-sm md:text-base px-2">
                    {isGettingLocation
                      ? "Obteniendo ubicación..."
                      : "Presiona 'Activar cámara' para comenzar"}
                  </p>
                  {isGettingLocation && (
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-wrap gap-2 md:gap-4 mt-2 justify-center">
              {!isCameraOn && (
                <button
                  className="bg-[#43A047] hover:bg-[#357a38] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={startCamera}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation
                    ? "Obteniendo ubicación..."
                    : "Activar Cámara"}
                </button>
              )}
              {isCameraOn && (
                <>
                  <button
                    className="bg-[#43A047] hover:bg-[#357a38] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-base md:text-lg"
                    onClick={takePhoto}
                  >
                    Tomar Foto
                  </button>
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-base md:text-lg"
                    onClick={stopCamera}
                  >
                    Detener
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center mt-3 gap-3">
            <img
              src={photo}
              alt="Rana Toro"
              className="rounded-lg border-4 border-[#43A047] shadow-lg w-full max-w-sm"
            />

            <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
              <button
                className="bg-[#43A047] hover:bg-[#357a38] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl flex items-center gap-2 font-semibold text-sm md:text-base"
                onClick={() => {
                  setPhoto(null);
                  startCamera();
                }}
              >
                <BackIcon className="size-4 md:size-5" />
                Volver a Capturar
              </button>
              <button
                className="bg-[#1976D2] hover:bg-[#1565C0] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl flex items-center gap-2 font-semibold text-sm md:text-base"
                onClick={savePhoto}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar Foto"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
