import { useAuth } from "../../context/AuthContext";
import GuestAvatar from "../../assets/singleLogo.png";
import { avatarsData } from "../avatars/avatarsData";

interface UserAvatarProps {
  className?: string;
}

export default function UserAvatar({ className }: UserAvatarProps) {
  const { user } = useAuth();

  // Si no hay usuario, mostrar el avatar genérico
  const avatarSrc =
    user?.avatar_id != null ? avatarsData[user.avatar_id]?.src : GuestAvatar;

  const backgroundColor = user?.background_color || "#000000";

  return (
    <div
      className={`rounded-full p-2 flex justify-center items-center shadow-lg border-[var(--color-text-main)] ${className}`}
      style={{ backgroundColor }}
    >
      <img
        src={avatarSrc}
        alt="User Avatar"
        className={`rounded-full object-cover ${
          avatarSrc === GuestAvatar ? "size-full" : ""
        }`}
      />
    </div>
  );
}
