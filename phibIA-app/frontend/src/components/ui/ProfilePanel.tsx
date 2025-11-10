import { useAuth } from "../../context/AuthContext";
import GuestAvatar from "../../assets/profileIcons/guestIcon.png";
import { avatarsData } from "../avatars/avatarsData";

interface UserAvatarProps {
  className?: string;
}

export default function UserAvatar({ className }: UserAvatarProps) {
  const { user } = useAuth();

  const avatarSrc =
    user?.avatar_id != null ? avatarsData[user.avatar_id]?.src : GuestAvatar;
  const backgroundColor = user?.background_color || "#000000";

  return (
    <div
      className={`
        relative 
        flex items-center justify-center 
        rounded-full overflow-hidden shadow-lg 
        border-[var(--color-text-main)] 
        ${className ?? ""} 
        shrink-0
      `}
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
