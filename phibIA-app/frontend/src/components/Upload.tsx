import TitleWithSubtitle from "./ui/TitleWithSubtitle";
import { type FormEvent, type ChangeEvent, type Dispatch, type SetStateAction, useState } from "react";
import Background from "/images/bgMainImage.jpg";
import ExitIcon from "../assets/uiIcons/exitIcon"
import FrogsMap from "./FrogsMap";
import MapPin from "../assets/uiIcons/ubicationPinIcon"


interface UploadProps {
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleImportSubmit: (e: FormEvent) => void;
  setIsImport: Dispatch<SetStateAction<boolean>>;
  setManualLocation: Dispatch<SetStateAction<{
    lat: number;
    lng: number;
  } | null>>;}

export default function Upload({
  handleFileChange,
  handleImportSubmit,
  setIsImport,
  setManualLocation
}: UploadProps) {
  const [showMiniMap, setShowMiniMap] = useState(false);

  return (
  <>
    {showMiniMap && (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white rounded-2xl p-4 w-80 h-80 md:w-96 md:h-96 flex flex-col">
          <FrogsMap
            onSelectLocation={(location) => {
              setManualLocation({ lat: location.lat, lng: location.lng });
              setShowMiniMap(false);
            }}
            especieDetectada={""} 
          />
          <button
            type="button"
            onClick={() => setShowMiniMap(false)}
            className="mt-2 bg-red-600 text-white rounded-xl px-4 py-2 hover:bg-red-700 self-center"
          >
            Cerrar
          </button>
        </div>
      </div>
    )}
    <div className="flex flex-col max-w-9/10 md:min-w-full md:h-3/5 rounded-3xl items-center justify-center shadow-xl">
      <div 
        className="relative w-full p-6 rounded-t-3xl flex justify-center items-center"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "top",
        }}
        >
        <div className="">
          <TitleWithSubtitle title="Importar audio" titleColor="white" />
        </div>

        <button
          type="button"
          onClick={() => setIsImport(false)}
          className="absolute top-4 right-4 text-white cursor-pointer">
          <ExitIcon 
            className="size-6" 
            />
        </button>
      </div>


      <form onSubmit={handleImportSubmit} className="space-y-4 bg-white w-full flex-1 flex flex-col justify-center items-center rounded-b-3xl p-5">
        <div className="flex flex-col w-2/3 items-start justify-center">
          <label className="text-md m-1">Audio:</label>
          <input
            type="file"
            accept="audio/*"
            onChange={ (e) => {handleFileChange(e); setShowMiniMap(true);}}
            className="
            w-full text-sm text-gray-300 bg-[#02372E] hover:bg-[#022721] cursor-pointer rounded-xl pr-3
            file:mr-4 file:py-2 file:px-4 
            file:rounded-r-full file:border-0 
            file:text-sm file:font-semibold
            file:bg-[#43A047] file:text-white
            hover:file:bg-[#357a38] file:cursor-pointer
            "
            />
        </div>

        <button
          type="submit"
          className="flex bg-[#43A047] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#357a38] text-white w-2/3 px-6 py-3 text-lg font-semibold items-center justify-center"
          >
          Detectar
        </button>

        <button
          type="button"
          onClick={() => setShowMiniMap(true)}
          className="cursor-pointer hover:brightness-110 text-(--color-text-main) w-50 md:w-60 text-lg font-semibold flex justify-center items-center gap-1"
          >
          Seleccionar ubicación
          <MapPin/>
        </button>
      </form>
    </div>
  </>
  );
}
