import { useState } from "react";
import { createPortal } from "react-dom";

interface PhotoCardProps {
  image: string | null;
  title: string;
  ubicacion: string;
  usuario: string;
  onConfirmar?: () => void;
  onRechazar?: () => void;
  isReviewing?: boolean;
  estado?: string;
}

function PhotoCard(props: PhotoCardProps) {
  const [expandida, setExpandida] = useState(false);
  const mostrarAcciones = props.onConfirmar || props.onRechazar;
  const esVistaPropia = props.estado !== undefined;

  const textoPlaceholder = () => {
    if (props.estado === "confirmada") return "¡Encontraste una Rana Toro!";
    if (props.estado === "rechazada")
      return "Foto eliminada: No era una rana toro";
    return "Foto eliminada";
  };

  return (
    <>
      {/* Miniatura */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden w-48 hover:scale-105 transition-all duration-300">
        <div
          onClick={() => props.image && setExpandida(true)}
          className={props.image ? "cursor-pointer" : ""}
        >
          {props.image ? (
            <img
              src={props.image}
              alt={props.title}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div
              className={`w-full ${
                esVistaPropia ? "h-20 px-3" : "h-40"
              } bg-gray-200 flex items-center justify-center text-gray-400 text-xs text-center`}
            >
              {textoPlaceholder()}
            </div>
          )}
        </div>
        <div className={esVistaPropia ? "p-3" : "p-4"}>
          <h3
            className={
              esVistaPropia
                ? "text-sm font-semibold text-gray-800"
                : "text-xl font-bold text-gray-800"
            }
          >
            {props.title}
          </h3>
          <p className="text-sm text-gray-500">{props.ubicacion}</p>
          {!(esVistaPropia && !props.image) && (
            <p className="text-sm text-gray-500">{props.usuario}</p>
          )}

          {mostrarAcciones && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={props.onConfirmar}
                disabled={props.isReviewing}
                className="bg-[#43A047] hover:bg-[#357a38] disabled:opacity-50 text-white text-xs font-semibold py-2 px-2 rounded-lg transition-colors cursor-pointer"
              >
                Es rana toro
              </button>
              <button
                onClick={props.onRechazar}
                disabled={props.isReviewing}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold py-2 px-2 rounded-lg transition-colors cursor-pointer"
              >
                No lo es
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox: se renderiza en un portal a document.body para que el
          fixed inset-0 cubra toda la pantalla, aunque algún ancestro tenga
          backdrop-blur (que crea su propio containing block para fixed). */}
      {expandida &&
        props.image &&
        createPortal(
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
                <h3 className="text-xl font-bold text-gray-800">
                  {props.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Ubicación:</strong> {props.ubicacion}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Usuario:</strong> {props.usuario}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default PhotoCard;
