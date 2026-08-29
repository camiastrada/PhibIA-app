import { useState } from "react";

interface PhotoCardProps {
  image: string;
  title: string;
  ubicacion: string;
  usuario: string;
  esMia: boolean;
}

function PhotoCard(props: PhotoCardProps) {
  const [expandida, setExpandida] = useState(false);

  return (
    <>
      {/* Miniatura */}
      <div
        onClick={() => setExpandida(true)}
        className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer w-48 hover:scale-105 transition-all duration-300"
      >
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

      {/* Lightbox: se renderiza aparte, tapando toda la pantalla */}
      {expandida && (
        <div
          onClick={() => setExpandida(false)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl overflow-hidden max-w-2xl w-full shadow-2xl"
          >
            <img
              src={props.image}
              alt={props.title}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-800">{props.title}</h3>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Ubicación:</strong> {props.ubicacion}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Usuario:</strong> {props.usuario}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PhotoCard;
