// src/pages/FrogsBulls.tsx
import { useState, useRef, useEffect } from "react";
import "../styles/App.css";
import TitleWithSubtitle from "../components/ui/TitleWithSubtitle";
import BackIcon from "../assets/uiIcons/backIcon";
import LocationMap from "../components/LocationMaps";

export default function FrogsBulls() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (isCameraOn && videoRef.current) {
      const video = videoRef.current;
      const handleCanPlay = () => {
        video.play().catch((e) => console.error("Error al reproducir:", e));
      };

      const handleLoadedMetadata = () => {
        console.log(
          "📏 Dimensiones del video:",
          video.videoWidth,
          "x",
          video.videoHeight
        );
      };

      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [isCameraOn]);

  const startCamera = async () => {
    try {
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
      const blob = await (await fetch(photo)).blob();
      const formData = new FormData();
      formData.append("image", blob, `frog_${Date.now()}.jpeg`);

      const res = await fetch("/api/save-photo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Error al guardar la foto");
      } else {
        alert("Foto guardada con éxito");
        setPhoto(null);
      }
    } catch (err) {
      console.error("Error al guardar la foto", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-800 flex justify-center items-center">
      <div className="flex flex-col items-center justify-center md:min-h-4/5 md:w-4/5 bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4">
        <TitleWithSubtitle title="Ranas Toros" />

        {!photo ? (
          <div className="flex flex-col items-center gap-4 mt-4">
            <div className={`relative ${isCameraOn ? "block" : "hidden"}`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="border-4 border-green-500 rounded-lg w-80 h-60 bg-black object-cover"
              />
              <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                Cámara Activa
              </div>
              <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                Mira hacia la cámara
              </div>
            </div>

            {!isCameraOn && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg w-80 h-60 flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2"></div>
                  <p>Presiona "Activar cámara" para comenzar</p>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-4 mt-2">
              {!isCameraOn && (
                <button
                  className="bg-[#43A047] hover:bg-[#357a38] text-white px-6 py-3 rounded-xl font-semibold text-lg"
                  onClick={startCamera}
                >
                  Activar Cámara
                </button>
              )}
              {isCameraOn && (
                <>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold text-lg"
                    onClick={takePhoto}
                  >
                    Tomar Foto
                  </button>
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold"
                    onClick={stopCamera}
                  >
                    Detener
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center mt-4 gap-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-green-700">
                ¡Foto tomada!
              </h3>
              <p className="text-gray-600">Revisa la imagen y guárdala</p>
            </div>
            <img
              src={photo}
              alt="Rana Toro"
              className="rounded-lg border-4 border-green-500 shadow-lg max-w-md"
            />
            <div className="flex gap-4 mt-4">
              <button
                className="bg-[#43A047] hover:bg-[#357a38] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold"
                onClick={() => {
                  setPhoto(null);
                  startCamera();
                }}
              >
                <BackIcon className="size-5" />
                Volver a Capturar
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold"
                onClick={() => {
                  savePhoto();
                }}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar Foto"}
              </button>
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-col items-center">
          <button
            className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-xl font-semibold text-lg"
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? "Ocultar mapa" : "Añadir ubicación"}
          </button>
          {showMap && (
            <div className="mt-6 w-[600px] h-[400px] rounded-2xl overflow-hidden border-4 border-green-500 bg-red-100">
              <LocationMap />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
