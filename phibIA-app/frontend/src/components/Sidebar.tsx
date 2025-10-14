
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-6">Mi Panel</h2>
      <nav className="flex flex-col space-y-2">
        <Link to="/dashboard/home" className="hover:bg-gray-700 p-2 rounded">Inicio</Link>
        <Link to="/dashboard/profile" className="hover:bg-gray-700 p-2 rounded">Perfil</Link>
        <Link to="/dashboard/settings" className="hover:bg-gray-700 p-2 rounded">Configuración</Link>
      </nav>
    </div>
  );
}
