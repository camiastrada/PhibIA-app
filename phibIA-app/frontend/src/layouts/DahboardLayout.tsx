// src/layouts/DashboardLayout.tsx
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import Background from '/images/bgMainImage.jpg'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-screen"style={{ backgroundImage: `url(${Background})`, backgroundSize: 'cover', backgroundPosition: 'top' }} >
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto" >
        <Outlet />
      </div>
    </div>
  );
}
