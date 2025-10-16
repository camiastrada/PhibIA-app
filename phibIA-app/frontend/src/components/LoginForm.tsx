import { useState,  type ChangeEvent, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginImage from '/images/loginImage.jpg';
import TextField from "./TextField.tsx";
import { Link } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}
export default function LoginForm() {

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const[error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Por favor, completa todos los campos");
      return;
    }
    setError("");
    console.log("Datos del formulario:", formData);
    // Aquí puedes agregar la lógica para enviar los datos a tu backend
    navigate('/home');
    setFormData({ email: "", password: "" });
  };

  useEffect(() => {
    const saved = localStorage.getItem("loginForm");
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("loginForm", JSON.stringify(formData));
  }, [formData]);

  return (
    <div className="flex flex-col md:flex-row w-full md:w-4/5 h-full md:h-4/5 items-center justify-between rounded-2xl shadow-2xl">

        <div className="absolute md:relative z-0 w-full md:w-1/2 h-full md:rounded-l-xl flex flex-col items-center justify-center p-8" style={{ backgroundImage: `url(${LoginImage})`, backgroundSize: 'cover', backgroundPosition: 'top' }}>
          <div className="absolute inset-0 bg-black opacity-40 md:rounded-l-xl"></div>
          <div className="bg-gradient-to-b from-black to-transparent absolute inset-0 h-1/3 md:hidden"></div>
          
          <div className="fixed mt-5 md:mt-0 md:relative top-0 md:inset-0 flex flex-col items-center z-10">
            <h1 className="text-5xl mb-4 text-center text-white font-extrabold">phibIA</h1>   
            <h2 className="text-lg mb-4 text-center text-white">Reconoce anfibios por su canto</h2>     
            <div className="relative hidden md:flex items-center mt-4 justify-center">
              <Link to="/register" className="absolute text-white font-semibold py-2 px-4 rounded-2xl border-1 border-white hover:border-2 transition-colors cursor-pointer">
                Registrarse
              </Link>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="fixed md:relative bottom-0 p-6 md:p-8 h-2/5 md:h-full w-full md:w-1/2 flex flex-col justify-center items-center bg-white/80 z-10 md:rounded-r-xl rounded-t-4xl md:rounded-t-none">
          <div className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-4 text-center text-[var(--color-text-main)] font-sans ">Iniciar Sesión</h2>

            <div className="w-full max-w-sm">

              <TextField type="email" placeholder="Correo electrónico" color="var(--color-text-main)" name="email" onChange={handleChange} icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-slate-500 md:hidden lg:block">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              }/>

              <TextField type="password" placeholder="Contraseña" color="var(--color-text-main)" name="password" onChange={handleChange} icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-slate-500 md:hidden lg:block">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              }/>
              
              {error && (
                <>
                <div className="flex flex-row justify-center items-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5 mx-1 mb-2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>

                  <p className=" text-sm mb-2">{error}</p>
                </div>
                </>
              )}

              <button type="submit" className="w-full bg-[#43a047] text-white py-2 rounded-lg hover:bg-[#388e3c] active:bg-[#388e3c] transition cursor-pointer">
                Entrar
              </button>

              <div className="flex justify-between md:justify-end mb-4">
                <a href="/register" className="text-sm text-blue-500 hover:text-blue-700 active:text-blue-700 mt-3 block md:hidden text-right">Registrarse</a >
                <a href="" className="text-sm text-slate-500 hover:text-slate-700 active:text-slate-700 mt-3 block text-right">Olvidé mi contraseña</a >
              </div>
            </div>
          </div>
        </form>
    </div>
  );
}