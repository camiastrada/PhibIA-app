import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CardGrid from "../components/CardGrid";
import TitleWithSubtitle from "../components/ui/TitleWithSubtitle";
import type { EstadoFoto } from "../components/PhotoCard";

interface Foto {
  id: number;
  url: string | null;
  titulo: string;
  ubicacion: string;
  usuario: string;
  estado?: EstadoFoto;
}

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

function Galery() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<"todas" | "mias">("todas");
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const fetchFotos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = filtro === "todas" ? "/photos/all" : "/user/photos";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 422) {
        navigate("/login");
        return;
      }

      if (response.status === 403) {
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Error al cargar las fotos");
      }

      const data = await response.json();
      const fotosMapeadas: Foto[] = data.photos.map((p: any) => ({
        id: p.imagen_id,
        url: p.url,
        titulo: p.usuario?.nombre ? `Foto de ${p.usuario.nombre}` : "Foto",
        ubicacion: p.ubicacion?.descripcion || "Ubicación desconocida",
        usuario: p.usuario?.nombre || user?.name || "Yo",
        estado: p.estado,
      }));

      setFotos(fotosMapeadas);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar las fotos"
      );
    } finally {
      setIsLoading(false);
    }
  }, [filtro, navigate, user?.name]);

  useEffect(() => {
    fetchFotos();
  }, [fetchFotos]);

  const reviewPhoto = async (imagenId: number, esRanaToro: boolean) => {
    try {
      setReviewingId(imagenId);
      const response = await fetch(`${API_URL}/photo/${imagenId}/review`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ es_rana_toro: esRanaToro }),
      });

      if (!response.ok) {
        throw new Error("Error al revisar la foto");
      }

      setFotos((prev) => prev.filter((f) => f.id !== imagenId));
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar la revisión de la foto");
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="h-[100dvh] pt-8 py-8 bg-[url('/images/backgrounds/background.png')] bg-cover bg-center">
      <div className="w-full h-full flex flex-col bg-[#004D40]/70 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
        <div className="text-white shrink-0">
          <TitleWithSubtitle title="Galería de fotos" subtitle="" />
        </div>

        <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start shrink-0">
          <button
            onClick={() => setFiltro("todas")}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              filtro === "todas"
                ? "bg-[#43a047] text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Ver todas las fotos
          </button>
          <button
            onClick={() => setFiltro("mias")}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              filtro === "mias"
                ? "bg-[#43a047] text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Ver solo mis fotos
          </button>
        </div>

        <div className="border-t border-white/20 my-6 shrink-0" />

        <div className="flex-1 min-h-0 overflow-y-auto px-2 scrollbar-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : fotos.length === 0 ? (
            <p className="text-white text-center py-12">
              No hay fotos para mostrar.
            </p>
          ) : (
            <CardGrid
              fotos={fotos}
              reviewingId={reviewingId}
              onConfirmar={
                filtro === "todas"
                  ? (id) => reviewPhoto(id, true)
                  : undefined
              }
              onRechazar={
                filtro === "todas"
                  ? (id) => reviewPhoto(id, false)
                  : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Galery;
