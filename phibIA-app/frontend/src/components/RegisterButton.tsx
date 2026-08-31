
import { Link } from "react-router-dom";
import "../styles/App.css"

export default function RegisterButton() {

  return (
    <div className='flex justify-center items-center m-6'>
      <Link
        to="/register"
        className='shadow-xl hover:scale-101 bg-white text-[var(--color-text-main)] border-2 border-[var(--color-text-main)] font-medium cursor-pointer rounded-xl flex flex-row justify-center items-center gap-2 p-3'>
        <p className='whitespace-nowrap'>Registrarme</p>
      </Link>
    </div>
  );
}
