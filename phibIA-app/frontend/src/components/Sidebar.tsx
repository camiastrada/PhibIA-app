import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "/images/whiteLogo.png";
import "../styles/sidebar.css";
import SidebarIcon from "./SidebarIcon.tsx";
import SidebarLabel from "./SidebarLabel.tsx";
import HomeIcon from "../assets/sidebarIcons/home.tsx";
import CapturesIcon from "../assets/sidebarIcons/mydetections.tsx";
import EncyclopediaIcon from "../assets/sidebarIcons/encyclopedia.tsx";
import MapIcon from "../assets/sidebarIcons/mapIcon.tsx";
import OcultBar from "../assets/sidebarIcons/ocultBar.tsx";
import GaleryIcon from "../assets/sidebarIcons/galery.tsx";
import ShowBar from "../assets/sidebarIcons/showBar.tsx";
import ProfilePanel from "./ui/ProfilePanel";
import { useAuth } from "../context/AuthContext.tsx";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { user, refreshUser } = useAuth();
  const isGuest = !user;
  const isAdmin = user?.rol === "admin";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error("Error al obtener perfil:", error);
      }
    };

    fetchUserData();
  }, [refreshUser]);

  return (
    <div className="hidden md:block h-screen">
      <div
        className={`fixed h-screen bg-[#02372E] text-white flex rounded-r-2xl bottom-0 left-0 top-0 shadow-lg z-20 transition-all duration-500 ease-in-out ${
          isOpen ? "w-80" : "w-20"
        }`}
      >
        <div className="w-20 flex flex-col items-center py-2 rounded-r-2xl bg-[#004D40]">
          <div className="h-16 flex items-center justify-center mb-8">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-2xl font-bold hover:bg-[#04463b] p-2 rounded-2xl cursor-pointer"
            >
              {isOpen ? (
                <OcultBar className="size-10 inline-block" />
              ) : (
                <ShowBar className="size-10 inline-block" />
              )}
            </button>
          </div>

          <nav className="flex flex-col gap-6 w-full flex-1 justify-center">
            <SidebarIcon to="/" id="homeIcon" icon={HomeIcon} />
            <SidebarIcon
              to="/captures"
              id="capturesIcon"
              icon={CapturesIcon}
              disabled={isGuest}
            />
            <SidebarIcon
              to="/encyclopedia"
              id="encyclopediaIcon"
              icon={EncyclopediaIcon}
            />
            <SidebarIcon to="/map" id="mapIcon" icon={MapIcon} />
            {isAdmin && (
              <SidebarIcon to="/galery" id="galeryIcon" icon={GaleryIcon} />
            )}
          </nav>
          
          {/* Perfil abajo */}
          <div className="h-16 flex items-center mt-4">
            <Link
              to="/profile"
              id="profileIcon"
              className="relative size-12 rounded-full outline-2 flex items-center justify-center"
            >
              <ProfilePanel className="size-12 border-none"/>
              {isGuest && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full size-4 flex items-center justify-center border border-white">
                  !
                </span>
              )}
            </Link>
          </div>
        </div>

        <div
          className={`flex-1 bg-[#02372E] rounded-r-2xl flex flex-col justify-between py-2 overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? "opacity-100 w-60" : "opacity-0 w-0"
          }`}
        >
          <div className="h-16 flex items-center mb-8">
            <img
              src={Logo}
              alt="Logo"
              className={`ml-4 w-40 h-auto transition-opacity duration-500 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          <nav
            className={`flex flex-col flex-1 justify-center gap-6 transition-opacity duration-500 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <SidebarLabel
              to="/"
              id="homeLabel"
              label="Inicio"
              isOpen={isOpen}
            />
            <SidebarLabel
              to="/captures"
              id="capturesLabel"
              label="Mis detecciones"
              isOpen={isOpen}
              disabled={isGuest}
            />
            <SidebarLabel
              to="/encyclopedia"
              id="encyclopediaLabel"
              label="Enciclopedia"
              isOpen={isOpen}
            />
            <SidebarLabel
              to="/map"
              id="mapLabel"
              label="Mapa de capturas"
              isOpen={isOpen}
            />
            {isAdmin && (
              <SidebarLabel
                to="/galery"
                id="galeryLabel"
                label="Galeria"
                isOpen={isOpen}
              />
            )}
          </nav>

          <div
            className={`h-16 flex items-center mt-4 transition-opacity duration-500 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <Link
              to="/profile"
              id="profileLabel"
              className="sidebarLabel flex items-center justify-start w-full h-full p-2"
            >
              <label className="text-lg ml-3 cursor-pointer">Perfil</label>
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? "w-80" : "w-20"
        }`}
      />
    </div>
  );
}
