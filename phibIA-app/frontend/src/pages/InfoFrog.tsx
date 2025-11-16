import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TitleWithSubtitle from '../components/ui/TitleWithSubtitle';

// Componente Modal de Especie
interface SpeciesInfo {
    nombre_cientifico: string;
    nombre_comun: string;
    descripcion: string;
    imagen: string;
    audio: string | null;
}

function InfoFrog() {
    const { specieNumber } = useParams<{ specieNumber: string }>();
    const navigate = useNavigate();

    const [species, setSpecies] = useState<SpeciesInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [imageError, setImageError] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL ?? "/api";

    useEffect(() => {
        fetchSpeciesInfo();

        // Cleanup: detener audio al desmontar
        return () => {
            if (audioElement) {
                audioElement.pause();
                setAudioElement(null);
            }
        };
    }, [specieNumber]);

    const fetchSpeciesInfo = async () => {
        if (!specieNumber) {
            setError('No se especificó una especie');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Obtener todas las especies
            const response = await fetch(`${API_URL}/informacion/especies`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Error al cargar información de especies');
            }

            const especies: SpeciesInfo[] = await response.json();

            // Buscar la especie por número 
            // Ejemplo: "1-Odontophrynus_asper" -> buscar especie con nombre que contenga "Odontophrynus asper"
            const speciesData = especies.find((e) => {
                // Normalizar nombres para comparación
                const normalizedDB = e.nombre_cientifico
                    .toLowerCase()
                    .replace(/_/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                // Normalizar el nombre de la URL (viene con %20 o espacios)
                const normalizedURL = specieNumber
                    .replace(/%20/g, ' ')    // URL encoded spaces
                    .replace(/\+/g, ' ')     // Puede venir con +
                    .toLowerCase()
                    .replace(/_/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                return normalizedDB === normalizedURL ||
                    normalizedDB.includes(normalizedURL) ||
                    normalizedURL.includes(normalizedDB);
            });
            if (speciesData) {
                setSpecies(speciesData);
            } else {
                setError(`No se encontró información para la especie: ${specieNumber}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            console.error('Error fetching species:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayAudio = () => {
        if (!species?.audio) return;

        if (audioElement) {
            if (isPlayingAudio) {
                audioElement.pause();
                setIsPlayingAudio(false);
            } else {
                audioElement.play();
                setIsPlayingAudio(true);
            }
        } else {
            const audio = new Audio(species.audio);
            audio.onended = () => setIsPlayingAudio(false);
            audio.onerror = () => {
                setIsPlayingAudio(false);
                alert('Error al reproducir el audio');
            };
            audio.play();
            setAudioElement(audio);
            setIsPlayingAudio(true);
        }
    };

    if (isLoading) {
        return (
          <div className="flex flex-col justify-center items-center w-full md:w-4/5 h-auto min-h-3/5 md:min-h-4/5 bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4">
            <TitleWithSubtitle
              title="Enciclopedia"
              subtitle="Cargando información..."
            />
            <div className="flex justify-center items-center mt-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#004D40]"></div>
            </div>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="flex flex-col justify-center items-center w-full md:w-4/5 h-auto min-h-3/5 md:min-h-4/5 bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4">
            <TitleWithSubtitle 
              title="Enciclopedia" 
              subtitle="Error al cargar" 
            />
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-6 max-w-md">
              {error}
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-[#43A047] hover:bg-[#357a38] text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg"
            >
              Volver al inicio
            </button>
          </div>
        );
      }
    
      if (!species) {
        return (
          <div className="flex flex-col justify-center items-center w-full md:w-4/5 h-auto min-h-3/5 md:min-h-4/5 bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4">
            <TitleWithSubtitle 
              title="Enciclopedia" 
              subtitle="Especie no encontrada" 
            />
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-[#43A047] hover:bg-[#357a38] text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg"
            >
              Volver al inicio
            </button>
          </div>
        );
      }
    
      // Renderizado principal - ESTRUCTURA SIMPLE
      return (
        <div className="flex flex-col justify-center items-center w-full md:w-4/5 h-auto min-h-3/5 md:min-h-4/5 bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4">
          
          {/* Título */}
          <TitleWithSubtitle
            title={species.nombre_comun}
            subtitle={species.nombre_cientifico || "Nombre no disponible"}
          />
    
          {/* Contenedor scrolleable */}
          <div className="w-full overflow-y-auto max-h-[calc(100vh-300px)] px-2">
            
            {/* Imagen */}
            <div className="flex justify-center mb-6 w-full">
              <div className="relative w-full max-w-md h-48 md:h-64 rounded-2xl overflow-hidden shadow-xl">
                {species.imagen && !imageError ? (
                  <img
                    src={`${API_URL}/species/${species.imagen}`}
                    alt={species.nombre_cientifico}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-400 to-emerald-500 flex flex-col items-center justify-center">
                    <svg className="w-24 h-24 md:w-32 md:h-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3a7 7 0 100 14 7 7 0 000-14zm0 2a5 5 0 110 10 5 5 0 010-10z"/>
                    </svg>
                    <span className="text-white text-sm mt-4">Imagen no disponible</span>
                  </div>
                )}
              </div>
            </div>
    
            {/* Botón de audio */}
            {species.audio && (
              <div className="flex justify-center mb-6">
                <button 
                  onClick={handlePlayAudio}
                  className="flex items-center gap-3 bg-[#43A047] hover:bg-[#357a38] text-white rounded-xl px-6 py-3 shadow-lg transition-all hover:scale-105 active:scale-95 font-semibold"
                >
                  {isPlayingAudio ? (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                      <span>Pausar canto</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>Escuchar canto</span>
                    </>
                  )}
                </button>
              </div>
            )}
    
            {/* Descripción */}
            <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 shadow-inner mb-6">
              <h3 className="text-lg font-bold text-[#004D40] mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Descripción
              </h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                {species.descripcion}
              </p>
            </div>
    
            {/* Cards de información */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto mb-6">
              <div className="bg-white rounded-xl p-4 shadow-md border-2 border-teal-100">
                <h4 className="font-semibold text-[#004D40] mb-2 flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Nombre científico
                </h4>
                <p className="text-gray-700 italic text-sm">{species.nombre_cientifico}</p>
              </div>
    
              <div className="bg-white rounded-xl p-4 shadow-md border-2 border-emerald-100">
                <h4 className="font-semibold text-[#004D40] mb-2 flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Nombre común
                </h4>
                <p className="text-gray-700 text-sm">{species.nombre_comun || "No disponible"}</p>
              </div>
            </div>
    
            {/* Botón volver */}
            <div className="flex justify-center pb-4">
              <button
                onClick={() => navigate('/')}
                className="bg-[#43A047] hover:bg-[#357a38] text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al inicio
              </button>
            </div>
    
          </div>
        </div>
      );
    }
    
    export default InfoFrog;