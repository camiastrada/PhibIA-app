import TitleWithSubtitle from "./ui/TitleWithSubtitle";
import type { FormEvent, ChangeEvent, Dispatch, SetStateAction } from "react";
import Background from "/images/bgMainImage.jpg";
import ExitIcon from "../assets/uiIcons/exitIcon"


interface UploadProps {
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  setIsImport: Dispatch<SetStateAction<boolean>>;}

export default function Upload({
  handleFileChange,
  handleSubmit,
  setIsImport,
}: UploadProps) {
  return (
    <div className="flex flex-col w-full md:w-3/5 h-2/3 md:h-3/5 md:rounded-3xl items-center justify-center shadow-xl">
      <div 
        className="relative w-full p-6 md:rounded-t-3xl flex justify-center items-center"
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


      <form onSubmit={handleSubmit} className="space-y-4 bg-white w-full flex-1 flex flex-col justify-center items-center md:rounded-b-3xl">
        <div className="flex flex-col w-2/3 items-start justify-center">
          <label className="text-md m-1">Audio:</label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
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
      </form>
    </div>
  );
}
