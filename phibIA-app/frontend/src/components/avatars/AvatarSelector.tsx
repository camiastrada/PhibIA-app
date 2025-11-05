import "../../styles/App.css"
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react"
import TitleWithSubtitle from "../ui/TitleWithSubtitle";
import Background from "/images/bgMainImage.jpg";
import AvatarList from "./AvatarList";
import ProfilePanel from "../../components/ui/ProfilePanel";
import { useAuth } from "../../context/AuthContext";


interface AvatarSelectorProps{
  setOpenAvatarSelector: Dispatch<SetStateAction<boolean>>;
}

export default function AvatarSelector(
  {setOpenAvatarSelector} : AvatarSelectorProps
) {
  const { user, updateAvatar } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<number>(user?.avatar_id ?? 0);
  const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error al obtener perfil");

        if (user?.avatar_id == null || user?.avatar_id !== data.avatar_id) {
          setSelectedAvatar(data.avatar_id);
          console.log("Avatar actual del usuario:", data.avatar_id);
        }
      } catch (error) {
        console.error("Error al cargar avatar actual:", error);
      }
    };

    fetchUserAvatar();
  }, []);

  useEffect(() => {
    if (selectedAvatar == null || !localStorage.getItem("authToken")) return;

    const changeIcon = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${BACKEND_URL}/update_avatar`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar_id: selectedAvatar }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error al actualizar avatar");

        console.log("✅ Avatar actualizado:", data.avatar_id);

        updateAvatar(selectedAvatar);
      } catch (error) {
        console.error("Error:", error);
        alert("Error al actualizar el avatar");
      }
    };

    changeIcon();
  }, [selectedAvatar]);

  return (
    <div className="flex flex-col w-full md:w-4/5 h-2/3 md:h-4/5 md:rounded-3xl items-center justify-center shadow-xl">
      <div 
        className="relative w-full p-6 md:rounded-t-3xl flex justify-center items-center"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "top",
        }}
      >
        <div className="">
          <TitleWithSubtitle title="Crea tu avatar" titleColor="white" />
        </div>
      </div>


      <div  className="space-y-4 bg-white w-full flex-1 flex justify-center items-center md:rounded-b-3xl gap-4 p-2">
        <div className="flex flex-col w-2/3 gap-3">
            <div className="grid-cols-4">
                <h2 className="text-xl font-bold mb-3">Elegí tu anfibio preferido</h2>
                <AvatarList
                    selectedId={selectedAvatar}
                    onSelect={(id) => setSelectedAvatar(id)}
                />
            </div>
            <button
            type="button"
            onClick={() => setOpenAvatarSelector(false)}
            className="flex bg-[#43A047] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#357a38] text-white  px-6 py-3 text-lg font-semibold items-center justify-center"
            >
            Confirmar
            </button>
        </div>
        <ProfilePanel className="size-50 border-6"/>
      </div>
    </div>
  );
}
