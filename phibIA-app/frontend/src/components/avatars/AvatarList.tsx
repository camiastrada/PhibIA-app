import AvatarItem from "./AvatarItem";
import { avatarsData } from "./avatarsData";

interface Props {
  onSelect?: (id: number) => void;
  selectedId?: number;
}

export default function AvatarList({ onSelect, selectedId }: Props) {
  return (
    <div
      className="
        grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 
        justify-items-center 
        overflow-y-auto 
        max-h-[60vh] 
        w-full
        p-2
      "
    >
      {avatarsData.map((avatar) => (
        <AvatarItem
          key={avatar.id}
          avatar={avatar}
          onSelect={onSelect}
          selected={selectedId === avatar.id}
        />
      ))}
    </div>
  );
}

