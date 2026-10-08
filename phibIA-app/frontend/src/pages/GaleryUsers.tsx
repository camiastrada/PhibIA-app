import { useEffect, useState } from "react";

interface Reporte {
  imagen_id: number;
  fecha_subida: string;
  usuario: string;
  ubicacion: string;
  latitud: number | null;
  longitud: number | null;
}

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function GaleryUsers() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/reportes/publicas`)
      .then((res) => {
        if (!res.ok)
          throw new Error("No se pudieron cargar los reportes de la rana toro");
        return res.json();
      })
      .then((data) => setReportes(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex-1 min-h-0 h-full px-3 md:px-4 py-4 md:py-8 bg-[url('/images/bgMainImage.webp')] bg-cover bg-center overflow-hidden">
      <div className="w-full h-full flex flex-col bg-[#004D40]/70 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
        <div className="shrink-0 mb-6">
          <h1
            className="text-3xl md:text-4xl text-[#F2E9DC]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Reportes confirmados
          </h1>
          <p className="text-[#B7CFC4] text-sm mt-1">
            Ranas toro reportadas por la comunidad
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#7CB342]" />
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-400/40 text-red-100 px-4 py-3 rounded-xl">
              {error}
            </div>
          ) : reportes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#B7CFC4]">
              <p>Todavía no hay reportes confirmados.</p>
              <p className="text-sm mt-1">
                Cuando alguien reporte uno, va a aparecer acá.
              </p>
            </div>
          ) : (
            <ol className="flex flex-col text-left">
              {reportes.map((r, i) => (
                <li
                  key={r.imagen_id}
                  className="relative border-l-2 border-[#7CB342]/40 pl-6 pb-7 last:pb-0 text-left"
                >
                  <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-[#7CB342]" />

                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <div className="flex flex-col items-start">
                      <span
                        className="text-[#F2E9DC] text-xl md:text-2xl leading-tight"
                        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                      >
                        {r.ubicacion}
                      </span>

                      {r.latitud != null && r.longitud != null && (
                        <a
                          href={`https://www.google.com/maps?q=${r.latitud},${r.longitud}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#7CB342] hover:underline mt-0.5"
                        >
                          📍 Ver en el mapa
                        </a>
                      )}
                    </div>

                    <span className="text-[#9FB8AD] text-sm pt-1.5">
                      {formatearFecha(r.fecha_subida)}
                    </span>
                  </div>

                  <p className="text-[#B7CFC4] text-sm mt-1">
                    Reportado por {r.usuario}
                    <span className="text-[#7CB342] ml-2">
                      · Reporte N.º {reportes.length - i}
                    </span>
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

export default GaleryUsers;
