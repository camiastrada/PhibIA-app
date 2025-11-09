
import { Link } from "react-router-dom";
import "../styles/App.css"

export default function LoginButton() {

  return (
    <div className='relative flex justify-center items-center m-6'>
      <Link
        to="/login"
        className='shadow-xl hover:scale-101 bg-[var(--color-text-main)] text-white font-medium cursor-pointer absolute rounded-xl flex flex-row justify-center items-center gap-2 p-3'>
        <p className='whitespace-nowrap'>Iniciar sesion</p>
      </Link>
    </div>
  );
}
