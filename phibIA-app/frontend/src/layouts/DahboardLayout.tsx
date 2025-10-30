// src/layouts/DashboardLayout.tsx
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Bottombar from "../components/Bottombar";
import { Outlet } from "react-router-dom";
import Background from "/images/bgMainImage.jpg";

export default function DashboardLayout() {
  return (
    <div
      className="flex flex-col md:flex-row h-screen w-screen items-center justify-between"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      <Sidebar />
      <Topbar />
      <div className="flex flex-col md:flex-row justify-center items-center w-full h-full overflow-y-clip overflow-x-hidden">
        <div className="flex md:hidden h-12 w-full"/>
        <div className="flex-1 flex md:flex-auto md:justify-center md:items-center h-full p-5">
          <Outlet />
        </div>
        <div className="flex md:hidden h-15 w-full"/>
      </div>
      <Bottombar />
    </div>
  );
}
