// src/layouts/DashboardLayout.tsx
import Sidebar from "../components/Sidebar";
import Bottombar from "../components/Bottombar";
import { Outlet } from "react-router-dom";
import Background from "/images/bgMainImage.webp";

export default function DashboardLayout() {
  return (
    <div
      className="h-screen w-screen overflow-x-hidden"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      {/* Layout principal: Sidebar + Contenido */}
      <div className="flex h-full scrollbar-hidden">
        {/* Sidebar solo en desktop */}
        <Sidebar />
        <main className="flex-1 min-h-0 flex justify-center items-stretch overflow-y-auto overflow-x-hidden scrollbar-hidden">
          {/* Contenido de la página */}
          <div className="w-full h-full min-h-0 flex justify-center p-5 pb-16 md:pb-0 scrollbar-hidden">
            <Outlet />
          </div>
        </main>
      </div>
            
      {/* Bottombar solo en mobile */}
      <Bottombar />
    </div>
  );
}
