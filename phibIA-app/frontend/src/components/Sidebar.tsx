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
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
    <div className="hidden md:block h-full">
      <div className="fixed h-screen w-20 bg-[#004D40] text-white flex flex-col rounded-r-2xl bottom-0 left-0 top-0 shadow-lg z-10 items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-2xl font-bold mt-4 hover:bg-[#04463b] p-2 rounded-2xl cursor-pointer"
          >
          {isOpen ? (
            <OcultBar className="size-10 inline-block"/>
          ) : (
            <ShowBar className="size-10 inline-block"/>
          )}
        </button>
        <nav className="relative flex flex-col bottom-30 gap-6 w-full justify-center">
          <SidebarIcon
            to="/"
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
        <div id="profileSection" className="size-12 bg-slate-300 rounded-full flex items-center justify-center mb-4 border-3 border-white hover:border-[#43a047]">
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

      <div className={`flex h-full ${isOpen ? "w-80" : "w-20"} bg-[#02372E] rounded-r-2xl transition-all duration-500 ease-in-out`}>  

        <div className={`w-20 h-full ${isOpen ? "opacity-100 duration 700" : "opacity-0 duration-250"} `}>

        </div>
 
        <div
          className="text-white flex flex-1 flex-col pt-2 justify-between shadow-lg transition-all duration-500 ease-in-out"
          style={isOpen ? { width: "320px" } : { width: "80px" }}
          >
          <img src={Logo} alt="Logo" className={`transition-all ease-in-out mt-2 ml-4 w-40 h-auto ${isOpen ? " opacity-100 duration-700" : "opacity-0 duration-200"}`} />
          
          <nav
            className={`${
              isOpen
              ? "opacity-100 duration-700"
              : "opacity-0 duration-250"
            } relative flex flex-col gap-6 bottom-30 transition-all ease-in-out `}
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
              />
            <SidebarLabel
              to="/encyclopedia"
              id="encyclopediaLabel"
              label="Enciclopedia"
              isOpen={isOpen}
              />
          </nav>
          <div className={`${
            isOpen
            ? "opacity-100 duration-700"
            : "opacity-0 duration-250"
          } flex mb-5 h-12 transition-all ease-in-out `}>
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
      </div>
    </div>
    </>
  );
}
