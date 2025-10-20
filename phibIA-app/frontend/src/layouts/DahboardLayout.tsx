// src/layouts/DashboardLayout.tsx
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Bottombar from "../components/Bottombar";
import { Outlet } from "react-router-dom";
import Background from '/images/bgMainImage.jpg'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-screen items-center"style={{ backgroundImage: `url(${Background})`, backgroundSize: 'cover', backgroundPosition: 'top' }} >
      <Topbar />
      <Bottombar /> 
      <Sidebar />
      <div className="flex justify-center items-center w-full h-full overflow-y-clip overflow-x-hidden" >
        <Outlet />
      </div>
    </div>
  );
}
