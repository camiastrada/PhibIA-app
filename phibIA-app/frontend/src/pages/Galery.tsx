import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CardGrid from "../components/CardGrid";
import TitleWithSubtitle from "../components/ui/TitleWithSubtitle";

const fotosDePrueba = [
  {
    id: 1,
    url: "https://picsum.photos/200",
    titulo: "Foto 1",
    ubicacion: "Río Cuarto",
    usuario: "Gringa",
    esMia: true,
  },
  {
    id: 2,
    url: "https://picsum.photos/201",
    titulo: "Foto 2",
    ubicacion: "Córdoba",
    usuario: "Juan",
    esMia: false,
  },
  {
    id: 3,
    url: "https://picsum.photos/202",
    titulo: "Foto 3",
    ubicacion: "Buenos Aires",
    usuario: "Gringa",
    esMia: true,
  },
  {
    id: 4,
    url: "https://picsum.photos/203",
    titulo: "Foto 4",
    ubicacion: "Buenos Aires",
    usuario: "Ruperto",
    esMia: true,
  },
  {
    id: 5,
    url: "https://picsum.photos/203",
    titulo: "Foto 5",
    ubicacion: "Buenos Aires",
    usuario: "Ruperto",
    esMia: true,
  },
  {
    id: 6,
    url: "https://picsum.photos/205",
    titulo: "Foto 6",
    ubicacion: "Buenos Aires",
    usuario: "Ruperto",
    esMia: true,
  },
  {
    id: 7,
    url: "https://picsum.photos/206",
    titulo: "Foto 7",
    ubicacion: "Buenos Aires",
    usuario: "Ruperto",
    esMia: true,
  },
  {
    id: 8,
    url: "https://picsum.photos/207",
    titulo: "Foto 8",
    ubicacion: "Buenos Aires",
    usuario: "Ruperto",
    esMia: true,
  },
  {
    id: 9,
    url: "https://picsum.photos/208",
    titulo: "Foto 9",
    ubicacion: "Buenos Aires",
    usuario: "Ruperto",
    esMia: true,
  },
  {
    id: 10,
    url: "https://picsum.photos/209",
    titulo: "Foto 10",
    ubicacion: "Buenos Aires",
    usuario: "Ruperto",
    esMia: true,
  },
];

function Galery() {
  const { user } = useAuth();
  const [filtro, setFiltro] = useState<"todas" | "mias">("todas");

  const fotosAMostrar =
    filtro === "mias"
      ? fotosDePrueba.filter((foto) => foto.esMia)
      : fotosDePrueba;

  return (
    <div className="h-[100dvh] pt-8 py-8 bg-[url('/images/backgrounds/background.png')] bg-cover bg-center">
      <div className="w-full h-full flex flex-col bg-[#004D40]/70 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
        <div className="text-white shrink-0">
          <TitleWithSubtitle title="Galería de fotos" subtitle="" />
        </div>

        {user && (
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
        )}

        <div className="border-t border-white/20 my-6 shrink-0" />

        <div className="flex-1 min-h-0 overflow-y-auto px-2 scrollbar-hidden">
          <CardGrid fotos={fotosAMostrar} />
        </div>
      </div>
    </div>
  );
}

export default Galery;
