import { useEffect, useState } from "react";
import GuestAvatar from "../../assets/singleLogo.png" 
import avatar1 from "../../assets/profileIcons/profileIcon1.png";
import avatar2 from "../../assets/profileIcons/profileIcon2.png";
import avatar3 from "../../assets/profileIcons/profileIcon3.png";

interface UserAvatarProps {
  size?: string; 
}

const avatars = [
  avatar1,
  avatar2,
  avatar3
];

export default function UserAvatar({ size = "size-20" }: UserAvatarProps) {
  const [avatarId, setAvatarId] = useState<number | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState(GuestAvatar);
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log("TOKEN: ", token);

        const response = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Error al obtener perfil");

        const data = await response.json();
        setAvatarId(data.avatar_id);
        if (data.avatar_id !== null && avatars[data.avatar_id]) {
          setCurrentAvatar(avatars[data.avatar_id]);
        } else {
          setCurrentAvatar(GuestAvatar);
        }
        setBackgroundColor(data.background_color || "#000000");
        console.log("AVATAR ID: ", avatarId, " COLOR: ", backgroundColor)
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div className={`rounded-full bg-gray-300 animate-pulse shadow-lg border-6 border-[var(--color-text-main)] ${size}`}></div>;
  }

  return (
    <div
      className={`rounded-full p-2 flex justify-center items-center shadow-lg border-6 border-[var(--color-text-main)] ${size}`}
      style={{ backgroundColor }}
    >
      <img
        src={currentAvatar}
        alt="User Avatar"
        className="rounded-full object-cover"
      />
    </div>
  );
}
