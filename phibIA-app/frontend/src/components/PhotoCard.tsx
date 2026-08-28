interface PhotoCardProps {
  image: string;
  title: string;
  ubicacion: string;
  usuario: string;
  esMia: boolean;
}

function PhotoCard(props: PhotoCardProps) {
  return (
    <div className="bg-white rounded-xl w-48 shadow-md overflow-hidden">
      <img
        src={props.image}
        alt={props.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800">{props.title}</h3>
        <p className="text-sm text-gray-500">{props.ubicacion}</p>
        <p className="text-sm text-gray-500">{props.usuario}</p>
      </div>
    </div>
  );
}

export default PhotoCard;
