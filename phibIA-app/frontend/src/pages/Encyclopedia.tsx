import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitleWithSubtitle from "../components/ui/TitleWithSubtitle";

interface SpeciesInfo {
  nombre_cientifico: string;
  nombre_comun: string;
  descripcion: string;
  imagen: string;
  audio: string | null;
}

function Encyclopedia() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState<SpeciesInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const API_URL = import.meta.env.VITE_API_URL ?? "/api";

  useEffect(() => {
    fetchSpecies();
  }, []);

  const fetchSpecies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/informacion/especies`);

      if (!response.ok) throw new Error("Error al cargar especies");

      const data: SpeciesInfo[] = await response.json();
      setSpecies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Cargando enciclopedia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 h-full px-3 md:px-4 py-4 md:py-8 bg-[url('/images/backgrounds/background.png')] bg-cover bg-center overflow-hidden">
      <div className="w-full h-full max-w-6xl mx-auto bg-[#004D40]/30 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-8 flex flex-col">
        <div className="text-white">
          <TitleWithSubtitle
            title="Enciclopedia de Especies"
            subtitle={`${species.length} especies registradas`}
          />
        </div>

        <div className="w-full overflow-y-auto flex-1 px-1 md:px-2 pr-2 md:pr-4 scrollbar-hidden">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-4 md:mt-8">
            {species.map((sp) => (
              <div
                key={sp.nombre_cientifico}
                className="bg-white/90 rounded-2xl shadow-lg p-4 text-[#004D40]"
              >
                {/* Foto */}
                <div className="w-full h-32 md:h-40 rounded-xl overflow-hidden bg-white/20 mb-3 md:mb-4 flex items-center justify-center">
                  {sp.imagen && !imageErrors[sp.nombre_cientifico] ? (
                    <img
                      src={`${API_URL}/species/${sp.imagen}`}
                      alt={sp.nombre_cientifico}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setImageErrors(prev => ({
                          ...prev,
                          [sp.nombre_cientifico]: true
                        }));
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white/80">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-12 h-12 mb-2 opacity-80"
                      >
                        <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14h18ZM5 7.41l3 3.01 2-2 4.59 4.58 3.42-3.42V17H5V7.41Z" />
                      </svg>
                      <span className="text-sm">Sin imagen</span>
                    </div>
                  )}
                </div>

                {/* Nombres */}
                <h3 className="text-base md:text-xl font-bold text-[#004D40] truncate">{sp.nombre_cientifico}</h3>
                <p className="text-[#004D40]/80">{sp.nombre_comun}</p>

                {/* Botón */}
                <button
                  onClick={() =>
                    navigate(`/encyclopedia/${sp.nombre_cientifico}`)
                  }
                  className="mt-4 w-full bg-[#43A047] hover:bg-[#357a38] text-white font-semibold py-2 px-4 rounded-xl transition-colors shadow-lg"
                >
                  Ver más
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Encyclopedia;