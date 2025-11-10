// src/layouts/DashboardLayout.tsx
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Bottombar from "../components/Bottombar";
import { Outlet } from "react-router-dom";
import Background from "/images/bgMainImage.jpg";

export default function DashboardLayout() {
  return (
    <div
      className="h-screen w-screen overflow-hidden"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      {/* Topbar solo en mobile */}
      <Topbar />
      
      {/* Layout principal: Sidebar + Contenido */}
      <div className="flex h-full">
        {/* Sidebar solo en desktop */}
        <Sidebar />
        <main className="flex-1 flex justify-center items-center overflow-y-auto overflow-x-hidden">
          {/* Espaciador superior mobile (para topbar) */}
          <div className="flex md:hidden h-12 w-full fixed top-0 pointer-events-none"></div>
          
          {/* Contenido de la página */}
          <div className="w-full h-full flex justify-center items-center p-5 mt-12 md:mt-0 mb-16 md:mb-0">
            <Outlet />
          </div>
        </main>
      </div>
      {/*      <main className="flex-1 relative flex justify-center items-center">
          {/* Container principal con márgenes automáticos para topbar/bottombar }
          <div className="absolute inset-0 md:static flex justify-center overflow-y-auto md:h-full md:w-full">
            <div className="container mx-auto max-w-5xl w-full flex justify-center items-center p-5 mt-12 mb-16 md:my-8">
              <div className="w-full h-full overflow-y-auto flex items-center justify-center">
                <Outlet />
              </div>
            </div>*/}
            
      {/* Bottombar solo en mobile */}
      <Bottombar />
    </div>
  );
}
