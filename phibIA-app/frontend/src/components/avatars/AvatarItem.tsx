import type { AvatarData } from "./avatarsData";
import "../../styles/App.css";

interface Props {
  avatar: AvatarData;
  onSelect?: (id: number) => void;
  selected?: boolean;
}

export default function AvatarItem({ avatar, onSelect, selected }: Props) {
  return (
    <button
      onClick={() => onSelect?.(avatar.id)}
      className={`
        relative 
        w-20 h-20 
        2xl:w-30 2xl:h-30
        rounded-full 
        overflow-hidden 
        bg-slate-200 
        flex items-center justify-center
        transition-all duration-200 
        cursor-pointer ring-4
        p-1
        ${selected ? "ring-[var(--color-text-secondary)]" : "hover:ring-[var(--color-text-main)]"}
      `}
    >
      <img
        src={avatar.src}
        alt={avatar.name}
        className="w-20 xl:w-30 h-auto object-cover"
      />
    </button>
  );
}
