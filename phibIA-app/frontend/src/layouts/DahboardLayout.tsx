// src/layouts/DashboardLayout.tsx
import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Bottombar from "../components/Bottombar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Background from "/images/bgMainImage.jpg";

export default function DashboardLayout() {
  const { refreshUser } = useAuth();

  useEffect(() => {
    // Cargar información del usuario al montar el componente
    refreshUser();
  }, [refreshUser]);

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
        <main className="flex-1 flex justify-center items-center overflow-y-auto overflow-x-hidden">
          {/* Espaciador superior mobile (para topbar) */}
          <div className="flex md:hidden h-12 w-full fixed top-0 pointer-events-none"/>
          
          {/* Contenido de la página */}
          <div className="w-full h-full flex justify-center items-center p-5 mt-12 md:mt-0 mb-16 md:mb-0">
            <Outlet />
          </div>
          
          {/* Espaciador inferior mobile (para bottombar) */}
          <div className="flex md:hidden h-16 w-full fixed bottom-0 pointer-events-none"/>
        </main>
      </div>
      
      {/* Bottombar solo en mobile */}
      <Bottombar />
    </div>
  );
}
