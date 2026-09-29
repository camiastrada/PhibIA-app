import { Link } from "react-router-dom";
import "../styles/App.css";

import RanaToroImg from "../assets/species/ranaToro.webp";
import CameraIcon from "../assets/uiIcons/cameraIcon";

function RanaToroCard() {
  return (
    <>
      {/* Versión desktop: tarjeta en la columna derecha */}
      <div className="w-3/5 h-full hidden md:flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center gap-3 rounded-2xl p-5 w-full max-w-xs bg-gradient-to-br from-[#FDF3E0] to-[#F4DFB8] border-2 border-[#E5B96B] shadow-lg">
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-2xl font-bold text-[#004D40]">
              Ayúdanos a encontrar a la rana toro
            </h2>
            <p className="text-sm text-[#6B4F2E] px-2">
              Es una especie invasora. Si la ves, avisános con una foto para
              cuidar nuestras especies nativas.
            </p>
          </div>

          <img
            src={RanaToroImg}
            alt="Rana Toro"
            className="w-34 h-26 md:w-36 md:h-28 rounded-2xl object-cover ring-4 ring-[#E5B96B] shadow-md"
          />

          <Link
            to="/add-photo"
            className="flex flex-row justify-center items-center gap-2 bg-[#43A047] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#357a38] text-white w-full px-6 py-3 text-lg font-semibold cursor-pointer"
          >
            <p>Tomar Foto</p>
            <CameraIcon className="size-6" />
          </Link>
        </div>
      </div>

      {/* Versión mobile: botón flotante (FAB) */}
      <Link
        to="/add-photo"
        aria-label="Ayudanos a encontrar a la rana toro"
        className="absolute -top-1 -right-1 z-30 md:hidden"
      >
        <span className="absolute inset-0 rounded-full bg-[#E5B96B]/50 animate-ping-soft" />
        <span className="relative block size-24 rounded-full overflow-hidden border-4 border-[#E5B96B] bg-[#F4DFB8] shadow-xl ">
          <img
            src={RanaToroImg}
            alt="Rana Toro"
            className="w-full h-full object-cover object-left"
          />
        </span>
      </Link>
    </>
  );
}

export default RanaToroCard;