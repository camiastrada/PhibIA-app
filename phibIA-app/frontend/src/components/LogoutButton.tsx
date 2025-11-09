import { useAuth } from '../context/AuthContext';
import LogoutIcon from "../assets/uiIcons/logoutIcon"
import "../styles/App.css"

export default function LogoutButton() {
  const { logout } = useAuth(); // Usar directamente el método logout del contexto

  return (
    <div className='relative flex justify-center items-center m-6'>
      <button
        type="button"
        onClick={logout} // Llamar directamente a logout
        className='shadow-xl hover:scale-101 bg-[var(--color-text-main)] text-white font-medium cursor-pointer absolute rounded-xl flex flex-row justify-center items-center gap-2 p-3'>
        <p className='whitespace-nowrap'>Cerrar sesión</p>
        <LogoutIcon className='transform scale-x-[-1] size-6' />
      </button>
    </div>
  );
}
