import "../../styles/App.css"
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect, useRef } from "react"
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
  const { user, updateAvatar, login } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<number>(user?.avatar_id ?? 0);
  const [selectedColor, setSelectedColor] = useState<string>(user?.background_color ?? "#000000");
  const [showProfilePanel, setShowProfilePanel] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

  //detecta el ancho del contenedor
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setShowProfilePanel(width > 600);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
        if (user?.background_color == null || user?.background_color !== data.background_color) {
          setSelectedColor(data.background_color);
          console.log("Color actual del usuario:", data.background_color);
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

  const handleColorChange = async (color: string) => {
    setSelectedColor(color);
    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${BACKEND_URL}/update_background`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ background_color: color }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error al actualizar color");

        console.log("🎨 Color actualizado:", data.background_color);

        if (user) {
          const updatedUser = { ...user, background_color: color };
          login(localStorage.getItem("authToken")!, updatedUser);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al actualizar el color");
      }
  };

  return (
    <div 
    ref={containerRef}
    className="flex flex-col w-full md:w-4/5 h-2/3 md:h-4/5 rounded-3xl items-center justify-center shadow-xl">
      <div 
        className="relative w-full p-6 rounded-t-3xl flex justify-center items-center"
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


      <div  className="space-y-4 bg-white w-full flex-1 flex justify-center items-center rounded-b-3xl gap-4 px-8">
        <div className="flex flex-col w-full gap-3 m-3">
            <h2 className="text-xl font-bold mb-3 whitespace-nowrap text-center">Elegí tu anfibio preferido</h2>
            <AvatarList
                selectedId={selectedAvatar}
                onSelect={(id) => setSelectedAvatar(id)}
            />
            <button
            type="button"
            onClick={() => setOpenAvatarSelector(false)}
            className="flex bg-[#43A047] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#357a38] text-white  px-6 py-3 text-lg font-semibold items-center justify-center"
            >
            Confirmar
            </button>
        </div>
        {showProfilePanel && (
          <div className="flex flex-col">
            <ProfilePanel className="size-45 xl:size-60 border-6" />
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-3">
              <label className="font-medium mb-1">Color:</label>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="color-circle size-8 rounded-full cursor-pointer border border-slate-400 shadow-xl hover:scale-102 transition-transform duration-150"
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  backgroundColor: selectedColor,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
