import PhotoCard from "./PhotoCard";

interface Photo {
  id: number;
  url: string;
  titulo: string;
  ubicacion: string;
  usuario: string;
  esMia: boolean;
}

interface CardGridProps {
  fotos: Photo[];
}

function CardGrid(props: CardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {props.fotos.map((photo) => (
        <PhotoCard
          key={photo.id}
          image={photo.url}
          title={photo.titulo}
          ubicacion={photo.ubicacion}
          usuario={photo.usuario}
          esMia={photo.esMia}
        />
      ))}
    </div>
  );
}

export default CardGrid;
