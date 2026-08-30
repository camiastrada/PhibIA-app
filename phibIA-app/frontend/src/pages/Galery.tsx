import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CardGrid from "../components/CardGrid";
import TitleWithSubtitle from "../components/ui/TitleWithSubtitle";
import { getCsrfToken } from "../utils/csrf";

type Filtro = "todas" | "mias" | "ranaToro";

interface Foto {
  id: number;
  url: string | null;
  titulo: string;
  ubicacion: string;
  usuario: string;
}

interface RegistroRanaToro {
  id: number;
  fecha: string;
  ubicacion: string;
  usuario: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Galery() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [registros, setRegistros] = useState<RegistroRanaToro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const handleAuthResponse = useCallback(
    (status: number) => {
      if (status === 401 || status === 422) {
        navigate("/login");
        return true;
      }
      if (status === 403) {
        navigate("/");
        return true;
      }
      return false;
    },
    [navigate]
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (filtro === "ranaToro") {
        const response = await fetch(`${API_URL}/photos/rana-toro`, {
          method: "GET",
          credentials: "include",
        });

        if (handleAuthResponse(response.status)) return;
        if (!response.ok) throw new Error("Error al cargar el registro");

        const data = await response.json();
        setRegistros(
          data.registros.map((r: any) => ({
            id: r.imagen_id,
            fecha: r.fecha,
            ubicacion: r.ubicacion?.descripcion || "Ubicación desconocida",
            usuario: r.usuario?.nombre || "Desconocido",
          }))
        );
        return;
      }

      const endpoint = filtro === "todas" ? "/photos/all" : "/user/photos";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        credentials: "include",
      });

      if (handleAuthResponse(response.status)) return;
      if (!response.ok) throw new Error("Error al cargar las fotos");

      const data = await response.json();
      const pendientes = data.photos.filter(
        (p: any) => p.estado === "pendiente"
      );
      setFotos(
        pendientes.map((p: any) => ({
          id: p.imagen_id,
          url: p.url,
          titulo: p.usuario?.nombre ? `Foto de ${p.usuario.nombre}` : "Foto",
          ubicacion: p.ubicacion?.descripcion || "Ubicación desconocida",
          usuario: p.usuario?.nombre || user?.name || "Yo",
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar la información"
      );
    } finally {
      setIsLoading(false);
    }
  }, [filtro, handleAuthResponse, user?.name]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reviewPhoto = async (imagenId: number, esRanaToro: boolean) => {
    try {
      setReviewingId(imagenId);
      const response = await fetch(`${API_URL}/photo/${imagenId}/review`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": getCsrfToken() },
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
          <button
            onClick={() => setFiltro("ranaToro")}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              filtro === "ranaToro"
                ? "bg-[#43a047] text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            🐸 Registro de ranas toro
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
          ) : filtro === "ranaToro" ? (
            registros.length === 0 ? (
              <p className="text-white text-center py-12">
                Todavía no hay avistamientos de rana toro confirmados.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {registros.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-2 text-white"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐸</span>
                      <div>
                        <p className="font-semibold">{r.ubicacion}</p>
                        <p className="text-sm text-white/70">
                          Reportado por {r.usuario}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-white/90">
                      {formatFecha(r.fecha)}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : fotos.length === 0 ? (
            <p className="text-white text-center py-12">
              No hay fotos pendientes de revisión.
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
