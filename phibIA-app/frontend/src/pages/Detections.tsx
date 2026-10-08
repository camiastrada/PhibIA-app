import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitleWithSubtitle from "../components/ui/TitleWithSubtitle";
import CardGrid from "../components/CardGrid";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";

interface Detection {
  audio_id: number;
  ruta: string;
  fecha_grabacion: string;
  especie: {
    id: number;
    nombre_cientifico: string;
    nombre_comun: string;
    descripcion: string;
    imagen: string;
  };
  ubicacion: {
    id: number;
    descripcion: string;
  };
}

interface Foto {
  imagen_id: number;
  url: string | null;
  fecha_subida: string;
  estado: string;
  ubicacion: {
    id: number;
    descripcion: string;
  } | null;
}

function Detections() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "admin";
  const [activeTab, setActiveTab] = useState<"audios" | "fotos">("audios");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [isLoadingFotos, setIsLoadingFotos] = useState(false);
  const [errorFotos, setErrorFotos] = useState<string | null>(null);
  const [fotosLoaded, setFotosLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetections();
  }, []);

  const fetchPhotos = async () => {
    try {
      setIsLoadingFotos(true);
      setErrorFotos(null);
      const response = await fetch(`${API_URL}/user/photos`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 422) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Error al cargar las fotos");
      }

      const data = await response.json();
      setFotos(data.photos);
      setFotosLoaded(true);
    } catch (err) {
      setErrorFotos(
        err instanceof Error ? err.message : "Error al cargar las fotos"
      );
    } finally {
      setIsLoadingFotos(false);
    }
  };

  const handleTabChange = (tab: "audios" | "fotos") => {
    setActiveTab(tab);
    if (tab === "fotos" && !fotosLoaded) {
      fetchPhotos();
    }
  };

  const estadoLabel = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return "Confirmada: rana toro";
      case "rechazada":
        return "Descartada";
      default:
        return "Pendiente de revisión";
    }
  };

  const fetchDetections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/user/captures`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 422) {
        // Usuario no autenticado, redirigir al login
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Error al cargar las detecciones");
      }

      const data = await response.json();
      setDetections(data.detections);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar las detecciones"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoDate: string) => {
    // Ajustar a zona horaria de Argentina (GMT-3)
    const date = new Date(isoDate);
    // Convertir a hora de Argentina (UTC-3)
    const argentinaDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
    
    return argentinaDate.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const formatTime = (isoDate: string) => {
    // Ajustar a zona horaria de Argentina (GMT-3)
    const date = new Date(isoDate);
    // Convertir a hora de Argentina (UTC-3)
    const argentinaDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
    
    return argentinaDate.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handlePlayAudio = async (audioId: number) => {
    if (playingAudio === audioId) {
      setPlayingAudio(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    } else {
      try {
        // Limpiar URL anterior si existe
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        // Obtener el audio del servidor
        const response = await fetch(`${API_URL}/audio/${audioId}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error al cargar el audio");
        }

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          // Audio almacenado en Cloudinary: reproducir la URL directa
          const data = await response.json();
          setAudioUrl(data.url);
        } else {
          // Audio local (retrocompatibilidad): cargarlo como blob
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
        setPlayingAudio(audioId);
      } catch (err) {
        console.error("Error al reproducir audio:", err);
        alert("No se pudo cargar el audio");
      }
    }
  };

  const handleDeleteAudio = async (audioId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta grabación?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/audio/${audioId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el audio");
      }

      // Actualizar la lista de detecciones
      setDetections(detections.filter(d => d.audio_id !== audioId));
      
      // Limpiar el audio si se estaba reproduciendo
      if (playingAudio === audioId) {
        setPlayingAudio(null);
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        }
      }
    } catch (err) {
      console.error("Error al eliminar audio:", err);
      alert("No se pudo eliminar el audio");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <TitleWithSubtitle
            title="Mis Detecciones"
            subtitle="Cargando tus grabaciones..."
          />
          <div className="flex justify-center items-center mt-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#004D40]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <TitleWithSubtitle title="Mis Detecciones" subtitle="Error al cargar" />
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-6">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 my-auto">
        <TitleWithSubtitle
          title="Mis Detecciones"
          subtitle={
            activeTab === "audios"
              ? `${detections.length} ${
                  detections.length === 1 ? "grabación" : "grabaciones"
                }`
              : `${fotos.length} ${fotos.length === 1 ? "foto" : "fotos"}`
          }
        />

        {!isAdmin && (
        <div className="flex gap-3 mt-4 justify-center">
          <button
            onClick={() => handleTabChange("audios")}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === "audios"
                ? "bg-[#43A047] text-white"
                : "bg-gray-100 text-[#004D40] hover:bg-gray-200"
            }`}
          >
            Grabaciones
          </button>
          <button
            onClick={() => handleTabChange("fotos")}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === "fotos"
                ? "bg-[#43A047] text-white"
                : "bg-gray-100 text-[#004D40] hover:bg-gray-200"
            }`}
          >
            Fotos
          </button>
        </div>
        )}

        {activeTab === "audios" ? (
        <div
          className="mt-6 max-h-[60vh] overflow-y-auto scrollbar-hidden detections-container"
        >
          {detections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[#004D40] mb-4">
                <svg
                  className="mx-auto h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#004D40] mb-2">
                No hay detecciones todavía
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza a grabar o subir audios para ver tus detecciones aquí
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-[#43A047] hover:bg-[#357a38] text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg"
              >
                Ir a grabar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detections.map((detection) => (
                <div
                  key={detection.audio_id}
                  className="bg-gradient-to-br from-[#004D40] to-[#00796B] rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all p-4"
                >
                  {/* Header con imagen */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-20 h-20 rounded-full bg-white/20 flex-shrink-0 overflow-hidden">
                      {detection.especie.imagen && !imageErrors.has(detection.audio_id) ? (
                        <img
                          src={`${API_URL}/species/${detection.especie.imagen}`}
                          alt={detection.especie.nombre_cientifico}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImageErrors(prev => new Set(prev).add(detection.audio_id));
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 3a7 7 0 100 14 7 7 0 000-14zm0 2a5 5 0 110 10 5 5 0 010-10z"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {detection.especie.nombre_cientifico}
                      </h3>
                      {detection.especie.nombre_comun && (
                        <p className="text-sm text-white/80">
                          {detection.especie.nombre_comun}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Información */}
                  <div className="bg-white/10 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-3 mb-2 text-sm text-white/90">
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDate(detection.fecha_grabacion)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{formatTime(detection.fecha_grabacion)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-white/90">
                      <svg
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{detection.ubicacion.descripcion}</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Botón  */}
                    <button 
                      onClick={() => navigate("/encyclopedia/" + detection.especie.nombre_cientifico)}
                      className="bg-[#00796B] hover:bg-[#004D40] text-white font-semibold py-3 px-2 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-lg"
                      title="Ver en enciclopedia"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span className="hidden sm:inline text-xs">Info</span>
                    </button>

                    {/* Botón Reproducir */}
                    <button
                      onClick={() => handlePlayAudio(detection.audio_id)}
                      className="bg-[#43A047] hover:bg-[#357a38] text-white font-semibold py-3 px-2 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-lg"
                    >
                      {playingAudio === detection.audio_id ? (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                          <span className="hidden sm:inline text-xs">Pausar</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span className="hidden sm:inline text-xs">Play</span>
                        </>
                      )}
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => handleDeleteAudio(detection.audio_id)}
                      className="bg-red-500/80 hover:bg-red-600 text-white font-semibold py-3 px-2 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-lg"
                      title="Eliminar grabación"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span className="hidden sm:inline text-xs">Borrar</span>
                    </button>
                  </div>

                  {playingAudio === detection.audio_id && audioUrl && (
                    <audio
                      src={audioUrl}
                      controls
                      autoPlay
                      className="w-full mt-3 rounded-lg"
                      onEnded={() => {
                        setPlayingAudio(null);
                        if (audioUrl) {
                          URL.revokeObjectURL(audioUrl);
                          setAudioUrl(null);
                        }
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        ) : (
        <div className="mt-6 max-h-[60vh] overflow-y-auto scrollbar-hidden detections-container">
          {isLoadingFotos ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#004D40]"></div>
            </div>
          ) : errorFotos ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {errorFotos}
            </div>
          ) : fotos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[#004D40] mb-4">
                <svg
                  className="mx-auto h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#004D40] mb-2">
                No hay fotos todavía
              </h3>
              <p className="text-gray-600 mb-6">
                Subí una foto para ver tus fotos aquí
              </p>
              <button
                onClick={() => navigate("/add-photo")}
                className="bg-[#43A047] hover:bg-[#357a38] text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg"
              >
                Subir foto
              </button>
            </div>
          ) : (
            <CardGrid
              fotos={fotos.map((foto) => ({
                id: foto.imagen_id,
                url: foto.url,
                titulo: `${formatDate(foto.fecha_subida)} · ${formatTime(
                  foto.fecha_subida
                )}`,
                ubicacion:
                  foto.ubicacion?.descripcion || "Ubicación desconocida",
                usuario: estadoLabel(foto.estado),
                estado: foto.estado,
              }))}
            />
          )}
        </div>
        )}
      </div>
    </div>
  );
}

export default Detections;
