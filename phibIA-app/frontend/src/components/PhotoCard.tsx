import { useState } from "react";

export type EstadoFoto = "pendiente" | "confirmada" | "rechazada";

interface PhotoCardProps {
  image: string | null;
  title: string;
  ubicacion: string;
  usuario: string;
  fecha?: string;
  estado?: EstadoFoto;
  onConfirmar?: () => void;
  onRechazar?: () => void;
  isReviewing?: boolean;
}

const ESTADO_INFO: Record<EstadoFoto, { label: string; className: string }> = {
  pendiente: {
    label: "🔍 Analizando foto...",
    className: "bg-yellow-500/90 text-white",
  },
  confirmada: {
    label: "🎉 ¡Genial! Encontraste una rana toro",
    className: "bg-[#43A047] text-white",
  },
  rechazada: {
    label: "😕 No era una rana toro",
    className: "bg-red-500/90 text-white",
  },
};

function PhotoCard(props: PhotoCardProps) {
  const [expandida, setExpandida] = useState(false);
  const estadoInfo = props.estado ? ESTADO_INFO[props.estado] : null;
  const mostrarAcciones =
    (props.onConfirmar || props.onRechazar) && props.estado === "pendiente";

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
            <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
              Foto eliminada
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-800">{props.title}</h3>
          <p className="text-sm text-gray-500">{props.ubicacion}</p>
          <p className="text-sm text-gray-500">{props.usuario}</p>

          {estadoInfo && (
            <span
              className={`inline-block mt-2 px-2 py-1 rounded-lg text-xs font-semibold ${estadoInfo.className}`}
            >
              {estadoInfo.label}
            </span>
          )}

          {mostrarAcciones && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={props.onConfirmar}
                disabled={props.isReviewing}
                className="bg-[#43A047] hover:bg-[#357a38] disabled:opacity-50 text-white text-xs font-semibold py-2 px-2 rounded-lg transition-colors cursor-pointer"
              >
                ✅ Es rana toro
              </button>
              <button
                onClick={props.onRechazar}
                disabled={props.isReviewing}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold py-2 px-2 rounded-lg transition-colors cursor-pointer"
              >
                ❌ No lo es
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox: se renderiza aparte, tapando toda la pantalla */}
      {expandida && props.image && (
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
