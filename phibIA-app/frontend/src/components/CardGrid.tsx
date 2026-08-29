import PhotoCard, { type EstadoFoto } from "./PhotoCard";

interface Photo {
  id: number;
  url: string | null;
  titulo: string;
  ubicacion: string;
  usuario: string;
  estado?: EstadoFoto;
}

interface CardGridProps {
  fotos: Photo[];
  onConfirmar?: (id: number) => void;
  onRechazar?: (id: number) => void;
  reviewingId?: number | null;
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
          estado={photo.estado}
          isReviewing={props.reviewingId === photo.id}
          onConfirmar={
            props.onConfirmar ? () => props.onConfirmar!(photo.id) : undefined
          }
          onRechazar={
            props.onRechazar ? () => props.onRechazar!(photo.id) : undefined
          }
        />
      ))}
    </div>
  );
}

export default CardGrid;
