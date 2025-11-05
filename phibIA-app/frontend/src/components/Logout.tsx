import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from "../assets/uiIcons/logoutIcon"
import "../styles/App.css"

export default function Logout() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  }

  return (
    <div className='relative flex justify-center items-center m-6'>
      <button type="button" onClick={() => {handleLogout()}} className='shadow-xl hover:scale-101 bg-[var(--color-text-main)] text-white  font-medium cursor-pointer absolute  rounded-xl flex flex-row justify-center items-center gap-2 p-3'>
        <p className='whitespace-nowrap'>Cerrar sesión</p>
        <LogoutIcon className='transform scale-x-[-1] size-6'/>
      </button>
    </div>
  );
}
