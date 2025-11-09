import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "/images/whiteLogo.png";
import "../styles/sidebar.css";
import SidebarIcon from "./SidebarIcon.tsx";
import SidebarLabel from "./SidebarLabel.tsx";
import HomeIcon from "../assets/sidebarIcons/home.tsx";
import CapturesIcon from "../assets/sidebarIcons/mydetections.tsx";
import EncyclopediaIcon from "../assets/sidebarIcons/encyclopedia.tsx";
import MapIcon from "../assets/sidebarIcons/mapIcon.tsx"
import OcultBar from "../assets/sidebarIcons/ocultBar.tsx";
import ShowBar from "../assets/sidebarIcons/showBar.tsx";
import ProfilePanel from "./ui/ProfilePanel";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="hidden md:block h-screen">
      <div 
        className={`fixed h-screen bg-[#02372E] text-white flex rounded-r-2xl bottom-0 left-0 top-0 shadow-lg z-20 transition-all duration-500 ease-in-out ${
          isOpen ? "w-80" : "w-20"
        }`}
      >
        {/* Columna de iconos (siempre visible) */}
        <div className="w-20 flex flex-col items-center py-4 rounded-r-2xl bg-[#004D40]">
          {/* Botón toggle arriba */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-2xl font-bold hover:bg-[#04463b] p-2 rounded-2xl cursor-pointer mb-8"
          >
            {isOpen ? (
              <OcultBar className="size-10 inline-block"/>
            ) : (
              <ShowBar className="size-10 inline-block"/>
            )}
          </button>
          
          {/* Navegación principal centrada */}
          <nav className="flex flex-col gap-6 w-full flex-1 justify-center mb-20">
            <SidebarIcon to="/" id="homeIcon" icon={HomeIcon} />
            <SidebarIcon to="/captures" id="capturesIcon" icon={CapturesIcon} disabled = {true} />
            <SidebarIcon to="/encyclopedia" id="encyclopediaIcon" icon={EncyclopediaIcon} disabled = {true} />  
            <SidebarIcon to="/map" id="mapIcon" icon={MapIcon} />  
          </nav>
          
          {/* Perfil abajo */}
          <Link
            to="/profile"
            id="profileIcon"
            className="size-12 rounded-full outline-2 flex items-center justify-center mt-4"
          >
            <ProfilePanel className="size-12 border-none"/>
          </Link>
        </div>

        {/* Panel expandible con labels */}
        <div 
          className={`flex-1 bg-[#02372E] rounded-r-2xl flex flex-col justify-between py-2 overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? "opacity-100 w-60" : "opacity-0 w-0"
          }`}
        >
          <img 
            src={Logo} 
            alt="Logo" 
            className={`mt-2 ml-4 w-40 h-auto transition-opacity duration-500 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`} 
          />
          
          <nav className={`flex flex-col flex-1 justify-center pt-4 gap-6 transition-opacity duration-500 mb-20 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}>
            <SidebarLabel to="/" id="homeLabel" label="Inicio" isOpen={isOpen} />
            <SidebarLabel to="/captures" id="capturesLabel" label="Mis detecciones" isOpen={isOpen} disabled = {true}/>
            <SidebarLabel to="/encyclopedia" id="encyclopediaLabel" label="Enciclopedia" isOpen={isOpen} disabled = {true}/>
            <SidebarLabel to="/map" id="mapLabel" label="Mapa de capturas" isOpen={isOpen} />
          </nav>
          
          <div className={`flex mb-3 h-12 transition-opacity duration-500 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}>
            <Link
              to="/profile"
              id="profileLabel"
              className="sidebarLabel flex items-center justify-start w-full h-full p-2"
            >
              <label className="text-lg ml-3 cursor-pointer">
                Perfil
              </label>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Espaciador para empujar el contenido */}
      <div className={`transition-all duration-500 ease-in-out ${
        isOpen ? "w-80" : "w-20"
      }`} />
    </div>
  );
}
