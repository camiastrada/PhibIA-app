import {useState} from "react";
import { Link } from "react-router-dom";
import Logo from "/images/whiteLogo.png";
import "../styles/sidebar.css"

export default function Sidebar() {
  const[isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed h-screen w-20 bg-[#004D40] text-white flex flex-col p-2 rounded-r-2xl  left-0 top-0 shadow-lg z-10">
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-2xl font-bold mt-2 hover:bg-[#04382f] p-2 rounded cursor-pointer">
          { isOpen ? (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-10 inline-block">
              <path d="M5.37671 9.67798H29.034M5.37671 17.2053H29.034M5.37671 24.7326H17.2054" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M26.3042 23.4043L32.8259 29.7873L26.3042 36.1703" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          ) : (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-10 inline-block">
              <path d="M5.37666 9.67798H29.0339M5.37666 17.2053H29.0339M5.37666 24.7326H17.2053" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M32.7888 36.1892L26.3043 29.7684L32.8631 23.4235" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          )}
        </button>
        <nav className="fixed flex flex-col top-50 inset-x-0 gap-6 w-20">
          <Link to="/dashboard/home" id="homeIcon" className="sidebarIcon p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-10 inline-block">
              <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </Link>
          <Link to="/dashboard/captures" id="capturesIcon" className="sidebarIcon p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-10 inline-block">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
          </Link>
          <Link to="/dashboard/encyclopedia" id="encyclopediaIcon" className="sidebarIcon p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-10 inline-block">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </Link>
        </nav>
      </div>

      <div className="h-screen w-80 bg-[#02372E] text-white flex flex-col items-end pt-2 rounded-r-2xl fixed left-0 top-0 shadow-lg transition-all duration-500 ease-in-out" style={ isOpen ? {width: '320px'} : {width: '80px'}}>
          <img src={Logo} alt="Logo" className="relative w-50 h-auto right-5"/>

          <nav className={`${isOpen ? "left-20 w-60 opacity-100 duration-700" : "w-20 left-0 opacity-0 duration-250"} fixed flex flex-col top-50 gap-6 h-54 transition-all ease-in-out `}>
            <Link to="/dashboard/home" id="homeLabel" className="sidebarLabel p-2 flex flex-row items-center h-1/3">
              <label className={`text-lg ml-3 cursor-pointer ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>Inicio</label>
            </Link>
            <Link to="/dashboard/captures" id="capturesLabel" className="sidebarLabel p-2 flex flex-row items-center h-1/3 whitespace-nowrap">
              <label className={`text-lg ml-3 cursor-pointer ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>Mis detecciones</label>
            </Link>
            <Link to="/dashboard/encyclopedia" id="encyclopediaLabel" className="sidebarLabel p-2 flex flex-row items-center h-1/3">
              <label className={`text-lg ml-3 cursor-pointer ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>Enciclopedia</label>
            </Link>
          </nav>

      </div>
    </>
  );
}

