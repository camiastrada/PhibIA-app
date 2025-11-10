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
        
        {/* Contenido principal */}
        <main className="flex-1 relative flex justify-center items-center">
          {/* Container principal con márgenes automáticos para topbar/bottombar */}
          <div className="absolute inset-0 md:static flex justify-center overflow-y-auto md:h-full md:w-full">
            <div className="container mx-auto max-w-5xl w-full flex justify-center items-center p-5 mt-12 mb-16 md:my-8">
              <div className="w-full h-full overflow-y-auto flex items-center justify-center">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Bottombar solo en mobile */}
      <Bottombar />
    </div>
  );
}
