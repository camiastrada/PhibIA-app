// src/layouts/DashboardLayout.tsx
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Bottombar from "../components/Bottombar";
import { Outlet } from "react-router-dom";
import Background from "/images/bgMainImage.jpg";

export default function DashboardLayout() {
  return (
    <div
      className="h-screen w-screen"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center">
        
        <aside className="hidden md:flex items-center h-screen">
         <Sidebar />
        </aside>

        <header className="flex flex-col items-center">
          <Topbar />
        </header>

        <main className="flex flex-col md:flex-row justify-center items-center w-full h-screen overflow-y-clip overflow-x-hidden">
          <div className="flex md:hidden h-12 w-full"/>
          <div className="flex-1 flex md:flex-auto md:justify-center md:items-center w-full h-full p-5">
            <Outlet />
          </div>
          <div className="flex md:hidden h-15 w-full"/>
        </main>
        
        <footer className="flex flex-col items-center">
          <Bottombar />
        </footer>
      </div>
    </div>
  );
}
