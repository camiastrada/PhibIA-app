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
  return (
    <div className="min-h-screen mt-8 px-4 py-8 bg-[url('/images/backgrounds/background.png')] bg-cover bg-center overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto bg-[#004D40]/30 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
        <div className="text-white">
          <TitleWithSubtitle title="Galería de fotos" subtitle="" />
        </div>
        <div className="w-full mt-4 overflow-y-auto max-h-[calc(100vh-120px)] px-2 scrollbar-hidden">
          <CardGrid fotos={fotosDePrueba} />
        </div>
      </div>
    </div>
  );
}

export default Galery;
