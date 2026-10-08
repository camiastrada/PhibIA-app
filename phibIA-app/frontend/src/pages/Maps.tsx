import FrogsMap from "../components/FrogsMap";

export default function Maps() {
  return (
    <div className="w-full h-full min-h-0 px-3 md:px-4 py-4 md:py-8 flex justify-center items-center">
      <div className="w-full max-w-6xl h-full min-h-0 bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4 flex flex-col items-center">
        <h1 className="shrink-0 mt-1 mb-2 text-xl md:text-2xl font-bold text-[#004D40] text-center">
          Mapa de capturas
        </h1>

        <div className="w-full flex-1 min-h-0 rounded-2xl overflow-hidden">
          <FrogsMap onSelectLocation={undefined} />
        </div>

        <div className="shrink-0 flex items-center justify-center gap-4 mt-3 mb-1 text-sm text-[#004D40]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-[#43A047] border border-white shadow" />
            Otras especies
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-[#E53935] border border-white shadow" />
            Rana toro
          </span>
        </div>
      </div>
    </div>
  );
}
