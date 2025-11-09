import "../styles/App.css";
import {useEffect, useState} from "react";
import ProfilePanel from "../components/ui/ProfilePanel";
import EditIcon from "../assets/uiIcons/editIcon";
import Logout from "../components/Logout";
import AvatarSelector from "../components/avatars/AvatarSelector";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { user, refreshUser } = useAuth(); // Eliminar logout del contexto
  const [openAvatarSelector, setOpenAvatarSelector] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await refreshUser(); // Usar la función del contexto para obtener los datos del usuario
      } catch (error) {
        console.error("Error al obtener perfil:", error);
      }
    };

    fetchUserData();
  }, [refreshUser]);

  return (
  <>
    <div className={openAvatarSelector ? "flex md:hidden absolute z-0 bg-black/50 w-screen h-screen top-0" : "hidden"}></div>
    <div className={openAvatarSelector ? "flex w-full h-full justify-center items-center z-10 shadow-2xl" : "hidden"}>
      <AvatarSelector setOpenAvatarSelector={setOpenAvatarSelector}/>
    </div>

    <div className={`flex-col lg:flex-row justify-center items-center md:min-h-4/5 md:w-4/5 w-full bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4
       ${openAvatarSelector ? "hidden" : "flex"}`}>
    
      <div className="flex flex-col w-full lg:w-1/2 items-center justify-center lg:border-r-2 border-[var(--color-text-main)]/70">

        <div className="rounded-full size-50 relative">
          <ProfilePanel className="size-50 border-6"/>
          <button 
          type="button" 
          onClick={() => setOpenAvatarSelector(true)}
          disabled = {openAvatarSelector} 
          className="absolute right-2 top-2 shadow-xl bg-white rounded-full size-10 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110">
            <EditIcon/>
          </button> 
        </div>

        <p className="text-lg font-medium mt-2 mb-6"> {user?.name || "Invitado"} </p>

        <Logout />
      </div>

      <div id="info" className="hidden lg:flex flex-col w-1/2 items-center justify-center gap-4">
        <div className="flex gap-2">
          <p className="font-medium text-[var(--color-text-main)]">Nº de detecciones: </p>
          <p>*detecciones totales*</p>
        </div>
        <p>*mas info para rellenar*</p>
        <p>*mas info para rellenar*</p>
        <p>*mas info para rellenar*</p>
        <p>*mas info para rellenar*</p>
      </div>
    </div>
  </>
  );
}

export default Login;
