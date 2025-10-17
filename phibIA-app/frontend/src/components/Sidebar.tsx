import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "/images/whiteLogo.png";
import "../styles/sidebar.css";
import SidebarIcon from "./SidebarIcon.tsx";
import SidebarLabel from "./SidebarLabel.tsx";
import HomeIcon from "../assets/sidebarIcons/home.tsx";
import CapturesIcon from "../assets/sidebarIcons/mydetections.tsx";
import EncyclopediaIcon from "../assets/sidebarIcons/encyclopedia.tsx";
import OcultBar from "../assets/sidebarIcons/ocultBar.tsx";
import ShowBar from "../assets/sidebarIcons/showBar.tsx";
import ProfileIcon from "../assets/sidebarIcons/profileIcon1.png";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  //const { pathname } = useLocation();
  return (
    <>
      <div className="fixed h-screen w-20 bg-[#004D40] text-white flex flex-col p-2 rounded-r-2xl left-0 top-0 shadow-lg z-10 items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-2xl font-bold mt-2 hover:bg-[#04463b] p-2 rounded cursor-pointer"
        >
          {isOpen ? (
            <OcultBar className="size-10 inline-block"/>
          ) : (
            <ShowBar className="size-10 inline-block"/>
          )}
        </button>
        <nav className="fixed flex flex-col top-50 inset-x-0 gap-6 w-20">
          <SidebarIcon
            to="/home"
            id="homeIcon"
            icon={HomeIcon} />
          <SidebarIcon
            to="/captures"
            id="capturesIcon"
            icon={CapturesIcon} />
          <SidebarIcon
            to="/encyclopedia"
            id="encyclopediaIcon"
            icon={EncyclopediaIcon} />
        </nav>
        <div id="profileSection" className="size-12 bg-slate-300 rounded-full flex items-center justify-center mb-2 border-3 border-white hover:border-[#43a047]">
          <Link
            to="/profile"
            id="profileIcon">
            <img
              src={ProfileIcon}
              alt="Profile"
              className="size-12 rounded-full"
            />
          </Link>
        </div>
      </div>

      <div
        className="h-screen w-80 bg-[#02372E] text-white flex flex-col items-end pt-2 rounded-r-2xl fixed left-0 top-0 justify-between shadow-lg transition-all duration-500 ease-in-out"
        style={isOpen ? { width: "320px" } : { width: "80px" }}
      >
        <img src={Logo} alt="Logo" className="relative w-50 h-auto right-5" />

        <nav
          className={`${
            isOpen
              ? "left-20 w-60 opacity-100 duration-700"
              : "w-20 left-0 opacity-0 duration-250"
          } fixed flex flex-col top-50 gap-6 h-54 transition-all ease-in-out `}
        >
          <SidebarLabel
            to="/home"
            id="homeLabel"
            label="Inicio"
            isOpen={isOpen}
          />
          <SidebarLabel
            to="/captures"
            id="capturesLabel"
            label="Mis detecciones"
            isOpen={isOpen}
          />
          <SidebarLabel
            to="/encyclopedia"
            id="encyclopediaLabel"
            label="Enciclopedia"
            isOpen={isOpen}
          />
        </nav>
        <div className="flex mb-4 h-12 items-center justify-start w-60">
          <Link
            to="/profile"
            id="profileLabel"
            className="sidebarLabel flex items-center justify-start w-full h-full p-2"
          >
            <label
              className={` text-lg ml-3 cursor-pointer transition-all duration-300 ${
                isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              Perfil
            </label>
          </Link>
        </div>
      </div>
    </>
  );
}
