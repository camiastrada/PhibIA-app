import TitleWithSubtitle from "./ui/TitleWithSubtitle";
import type { FormEvent, ChangeEvent } from "react";

interface UploadProps {
  file: File | null;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => void;
}

export default function Upload({
  file,
  handleFileChange,
  handleSubmit,
}: UploadProps) {
  return (
    <div className="flex flex-col w-full md:w-3/5 h-auto md:h-3/5 items-center justify-center bg-white rounded-3xl shadow-xl">
      <TitleWithSubtitle title="Importar audio" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="w-full cursor-pointer"
        />

        {file && (
          <p className="text-sm text-gray-600">
            Archivo: <span className="font-semibold">{file.name}</span>
          </p>
        )}

        <button
          type="submit"
          className="flex bg-[#43A047] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#357a38] text-white w-full px-6 py-3 text-lg font-semibold items-center justify-center"
        >
          Detectar
        </button>
      </form>
    </div>
  );
}
