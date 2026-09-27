import { useState, useRef, useEffect, useCallback } from "react";
import "../styles/App.css";
import TitleWithSubtitle from "../components/ui/TitleWithSubtitle";
import BackIcon from "../assets/uiIcons/backIcon";
import Toast from "../components/ui/Toast";
import FrogsMap from "../components/FrogsMap";
import MapPin from "../assets/uiIcons/ubicationPinIcon";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYWdvc3JvZHJpZ3VleiIsImEiOiJjbWhjeWRmcHcwZ2Y4MmxwdHRxa2x2Zm15In0.9cwGVix-S-zFHfXSs1DgBw";

async function getLocationDescription(lng: number, lat: number): Promise<string> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es`
    );

    if (!response.ok) return "Ubicación del usuario";

    const data = await response.json();
    const features = data.features || [];
    if (features.length === 0) return "Ubicación del usuario";

    const place = features.find(
      (f: any) => f.place_type.includes("place") || f.place_type.includes("locality")
    );

    return place?.text || features[0]?.text || "Ubicación del usuario";
  } catch (error) {
    console.error("Error al obtener descripción de ubicación:", error);
    return "Ubicación del usuario";
  }
}

export default function FrogsBulls() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoSource, setPhotoSource] = useState<"camera" | "upload" | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

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

  // Cleanup: apaga la cámara si el componente se desmonta mientras está prendida
  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
        showToast(
          `Sin ubicación: ${error.message}`,
          "error"
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
      showToast(
        "No se pudo acceder a la cámara. Permite los permisos.",
        "error"
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
    setPhotoSource("camera");

    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      showToast("Formato no permitido. Usa JPG o PNG.", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("La imagen no debe superar 10 MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string);
      setPhotoSource("upload");
      setUserLocation(null);
      setShowMiniMap(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const resetPhoto = () => {
    setPhoto(null);
    setPhotoSource(null);
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
        const descripcion = await getLocationDescription(
          userLocation.lng,
          userLocation.lat
        );
        formData.append("descripcion", descripcion);
      }

      const API_URL = import.meta.env.VITE_API_URL ?? "/api";
      const res = await fetch(`${API_URL}/save-photo`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error al guardar la foto:", errorData);
        showToast(
          `Error: ${errorData.error || "Error desconocido"}`,
          "error"
        );
      } else {
        const result = await res.json();
        console.log("Foto guardada:", result);
        showToast("Foto guardada con éxito", "success");
        resetPhoto();
        setUserLocation(null);
      }
    } catch (err) {
      console.error("Error al guardar la foto", err);
      showToast("Error al guardar la foto. Intenta nuevamente.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 h-full px-3 md:px-4 py-4 md:py-8 overflow-hidden flex justify-center items-center">
      {showMiniMap && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-4 w-80 h-[22rem] md:w-96 md:h-[26rem] flex flex-col">
            <p className="text-center text-sm md:text-base font-semibold text-[#004D40] mb-2">
              Marcá dónde tomaste esta foto
            </p>
            <FrogsMap
              onSelectLocation={(location) => {
                setUserLocation({ lat: location.lat, lng: location.lng });
                setShowMiniMap(false);
              }}
              especieDetectada={""}
            />
            <button
              type="button"
              onClick={() => setShowMiniMap(false)}
              className="mt-2 bg-red-600 text-white rounded-xl px-4 py-2 hover:bg-red-700 self-center"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col justify-center items-center w-full h-full max-w-6xl my-4 md:my-0 max-h-[calc(100vh-4rem)] md:max-h-[85vh] overflow-y-auto bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-3 md:p-5">
        <div className="w-full h-full flex flex-col items-center">
          <div className="m-auto w-full flex flex-col items-center">
          <TitleWithSubtitle
            title={"¿Descubriste una rana toro?"}
            subtitle={
              "Tomale una foto para notificar su ubicación"
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
                        : "Activá la cámara o subí una foto desde tu galería"}
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="flex flex-wrap gap-2 md:gap-4 mt-2 justify-center">
                {!isCameraOn && (
                  <>
                    <button
                      className="bg-[#43A047] hover:bg-[#357a38] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={startCamera}
                      disabled={isGettingLocation}
                    >
                      {isGettingLocation
                        ? "Obteniendo ubicación..."
                        : "Activar Cámara"}
                    </button>
                    <button
                      className="bg-[#1976D2] hover:bg-[#1565C0] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-base md:text-lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Subir desde galería
                    </button>
                  </>
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
                className="rounded-lg border-4 border-[#43A047] shadow-lg w-auto max-w-full max-h-[40vh] md:max-h-[45vh] object-contain"
              />

              <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                <button
                  className="bg-[#43A047] hover:bg-[#357a38] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl flex items-center gap-2 font-semibold text-sm md:text-base"
                  onClick={() => {
                    resetPhoto();
                    if (photoSource === "camera") {
                      startCamera();
                    }
                  }}
                >
                  <BackIcon className="size-4 md:size-5" />
                  {photoSource === "camera" ? "Volver a Capturar" : "Elegir otra foto"}
                </button>
                <button
                  className="bg-[#1976D2] hover:bg-[#1565C0] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl flex items-center gap-2 font-semibold text-sm md:text-base"
                  onClick={savePhoto}
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Guardar Foto"}
                </button>
              </div>

              {photoSource === "upload" && (
                <button
                  type="button"
                  onClick={() => setShowMiniMap(true)}
                  className="cursor-pointer hover:brightness-110 text-(--color-text-main) text-sm md:text-base font-semibold flex justify-center items-center gap-1"
                >
                  {userLocation ? "Cambiar ubicación" : "Seleccionar ubicación"}
                  <MapPin />
                </button>
              )}
            </div>
          )}
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
