import FrogsMap from "../components/FrogsMap";

export default function Maps() {
  return (
    <div className="w-full md:w-4/5 h-[70vh] md:h-[75vh] rounded-2xl overflow-hidden">
      <FrogsMap onSelectLocation={undefined} />
    </div>
  );
}
