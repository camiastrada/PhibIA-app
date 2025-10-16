import { useState,  type ChangeEvent, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterImage from '/images/registerImage.jpg';
import TextField from "./TextField.tsx";
import { Link } from "react-router-dom";

interface RegisterFormData {
  user: string;
  email: string;
  password: string;
}

export default function RegisterForm() {

  const [formData, setFormData] = useState<RegisterFormData>({
    user: "",
    email: "",
    password: "",
  });

  const[confirmPassword, setConfirmPassword] = useState("");

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
    if (formData.password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!formData.user || !formData.email || !formData.password || !confirmPassword) {
      setError("Por favor, completa todos los campos");
      return;
    }
    setError("");
    console.log("Datos del formulario:", formData);
    // Aquí puedes agregar la lógica para enviar los datos a tu backend
    navigate('/login');
    
  };

  useEffect(() => {
    const saved = localStorage.getItem("registerForm");
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("registerForm", JSON.stringify(formData));
  }, [formData]);

  return (
    <div className="flex flex-col md:flex-row w-full md:w-4/5 h-full md:h-4/5 items-center justify-between rounded-2xl shadow-2xl">

        <form onSubmit={handleSubmit} className="fixed md:relative bottom-0 p-6 md:p-8 h-1/2 md:h-full w-full md:w-1/2 flex flex-col justify-center items-center bg-white/80 md:bg-none z-10 md:rounded-l-xl rounded-t-4xl md:rounded-t-none">
          <div className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-4 text-center text-[#A24C25] font-sans ">Registrate</h2>

            <div className="w-full max-w-sm">

              <TextField type="email" placeholder="Correo electrónico" color="#C0592B" name="email" onChange={handleChange} icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-slate-500 md:hidden lg:block">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              }/>

              <TextField type="text" placeholder="Nombre de usuario" color="#C0592B" name="user" onChange={handleChange} icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              }/>

              <TextField type="password" placeholder="Contraseña" color="#C0592B" name="password" onChange={handleChange} icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-slate-500 md:hidden lg:block">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              }/>

              <TextField type="password" placeholder="Confirmar contraseña" color="#C0592B" onChange={(e) => setConfirmPassword(e.target.value)} icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-slate-500 md:hidden lg:block">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              }/>
              
              {error && (
                <>
                <div className="flex flex-row justify-center items-center text-[#A24C25]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5 mx-1 mb-2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>

                  <p className="text-sm mb-2">{error}</p>
                </div>
                </>
              )}

              <button type="submit" className="w-full bg-[#C0592B] text-white py-2 rounded-lg hover:bg-[#b15327] active:bg-[#b15327] transition cursor-pointer">
                Registrate
              </button>

              <div className="flex justify-center mb-4">
                <h1 className="text-sm text-slate-500 mt-3 block text-right">¿Ya tenés cuenta? </h1 >
                <a href="/login" className="text-sm text-blue-500 hover:text-blue-700 active:text-blue-700 mt-3 block text-right ml-1">Iniciar Sesión</a >
              </div>
            </div>
          </div>
        </form>

        <div className="absolute md:relative z-0 w-full md:w-1/2 h-full md:rounded-r-xl flex flex-col items-center justify-center p-8" style={{ backgroundImage: `url(${RegisterImage})`, backgroundSize: 'cover', backgroundPosition: 'top' }}>
          <div className="absolute inset-0 bg-black opacity-40 md:rounded-r-xl"></div>
          <div className="bg-gradient-to-b from-black to-transparent absolute inset-0 h-1/3 md:hidden"></div>
          
          <div className="fixed mt-5 md:mt-0 top-0 md:top-2/7 flex flex-col items-center z-10">
            <h1 className="text-5xl mb-4 text-center text-white font-extrabold">phibIA</h1>   
            <h2 className="text-lg mb-4 text-center text-white">Reconoce anfibios por su canto</h2>     
            <div className="relative hidden md:flex items-center mt-4 justify-center">
              <Link to="/login" className="absolute text-white font-semibold py-2 px-4 rounded-2xl border-1 border-white hover:border-2 transition-colors cursor-pointer whitespace-nowrap">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
        
    </div>
  );
}