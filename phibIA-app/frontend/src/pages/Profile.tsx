import "../styles/App.css";
import {useEffect, useState} from "react";
import ProfilePanel from "../components/ui/ProfilePanel";
import EditIcon from "../assets/uiIcons/editIcon";
import LogoutButton from "../components/LogoutButton";
import LoginButton from "../components/LoginButton";
import RegisterButton from "../components/RegisterButton";
import AvatarSelector from "../components/avatars/AvatarSelector";
import { useAuth } from "../context/AuthContext";

interface Detection {
  audio_id: number;
  ruta: string;
  fecha_grabacion: string;
  especie: {
    id: number;
    nombre_cientifico: string;
    nombre_comun: string;
    descripcion: string;
    imagen: string;
  };
  ubicacion: {
    id: number;
    descripcion: string;
  };
}

function Profile() {
  const { user, refreshUser } = useAuth(); // Eliminar logout del contexto
  const isGuest = !user;
  const [openAvatarSelector, setOpenAvatarSelector] = useState(false);
  const [totalDetections, setTotalDetections] = useState(0);
  const [distinctSpecies, setDistinctSpecies] = useState(0);
  const [totalSpecies, setTotalSpecies] = useState(0);
  const [mostCaptured, setMostCaptured] = useState<{ nombre_comun: string; nombre_cientifico: string } | null>(null);

  const API_URL = import.meta.env.VITE_API_URL ?? "/api";

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

  useEffect(() => {
    if (isGuest) return;

    const fetchStats = async () => {
      try {
        const [capturesRes, speciesRes] = await Promise.all([
          fetch(`${API_URL}/user/captures`, { credentials: "include" }),
          fetch(`${API_URL}/informacion/especies`),
        ]);

        if (!capturesRes.ok || !speciesRes.ok) {
          console.error("Error al cargar estadísticas");
          return;
        }

        const capturesData = await capturesRes.json();
        const detections: Detection[] = capturesData.detections ?? [];
        const speciesInfo = await speciesRes.json();

        setTotalDetections(detections.length);

        const countBySpecies = new Map<number, { nombre_comun: string; nombre_cientifico: string; count: number }>();
        detections.forEach((d) => {
          const entry = countBySpecies.get(d.especie.id);
          if (entry) {
            entry.count += 1;
          } else {
            countBySpecies.set(d.especie.id, {
              nombre_comun: d.especie.nombre_comun,
              nombre_cientifico: d.especie.nombre_cientifico,
              count: 1,
            });
          }
        });

        setDistinctSpecies(countBySpecies.size);
        setTotalSpecies(Array.isArray(speciesInfo) ? speciesInfo.length : 0);

        let top = null as { nombre_comun: string; nombre_cientifico: string; count: number } | null;
        countBySpecies.forEach((entry) => {
          if (!top || entry.count > top.count) {
            top = { nombre_comun: entry.nombre_comun, nombre_cientifico: entry.nombre_cientifico, count: entry.count };
          }
        });
        setMostCaptured(top ? { nombre_comun: top.nombre_comun, nombre_cientifico: top.nombre_cientifico } : null);
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
      }
    };

    fetchStats();
  }, [isGuest, API_URL]);

  return (
  <>
    <div className={openAvatarSelector ? "flex z-[5] bg-black/50  w-full h-full fixed inset-0 top-0" : "hidden"}></div>
    <div className={openAvatarSelector ? "flex w-full h-full justify-center items-center z-10 shadow-2xl" : "hidden"}>
      <AvatarSelector setOpenAvatarSelector={setOpenAvatarSelector}/>
    </div>
    <div className={`flex-1 min-h-0 h-full px-3 md:px-4 py-4 md:py-8 bg-[...] bg-cover bg-center overflow-hidden flex justify-center items-center ${openAvatarSelector ? "hidden" : ""}`}>
      <div className={`flex-col lg:flex-row justify-center items-center w-full h-full max-w-6xl bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4 ${openAvatarSelector ? "hidden" : "flex"}`}>
      
        <div className={`flex flex-col w-full lg:w-1/2 items-center justify-center 
          ${isGuest ? "border-none" : "lg:border-r-2 border-(--color-text-main)/70"}`}>

          <div className="rounded-full size-36 md:size-50 relative">
            <ProfilePanel className="size-36 md:size-50 border-6"/>
            <button 
            type="button" 
            onClick={() => setOpenAvatarSelector(true)}
            disabled = {openAvatarSelector} 
            className={`absolute right-2 top-2 shadow-xl bg-white rounded-full size-10 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110
            ${isGuest ? "hidden" : "flex"}`}>
              <EditIcon/>
            </button> 
          </div>

          <p className="text-lg font-medium mt-2 mb-6"> {user?.name || "Invitado"} </p>

          {isGuest ? (
            <div className="flex flex-row flex-wrap justify-center">
              <LoginButton/>
              <RegisterButton/>
            </div>
          ) : (<LogoutButton />)}
        </div>

        <div className={`flex-1 w-full lg:w-auto justify-center items-center ${isGuest ? "hidden" : "flex"}`}>
          <div id="info" className="flex-none flex-col flex w-full lg:w-auto items-start justify-center gap-4 px-2 mt-6 lg:mt-0" >
            <div className="flex justify-start items-center gap-2 flex-wrap">
              <p className="font-medium text-[var(--color-text-main)]">Nº de detecciones:</p>
              <p className="text-[var(--color-text-main)]">{totalDetections}</p>
            </div>
            <div className="flex justify-start items-center gap-2 flex-wrap">
              <p className="font-medium text-[var(--color-text-main)]">Especie más capturada:</p>
              {mostCaptured ? (
                <div className="flex flex-row justify-start items-center gap-1 flex-wrap">
                  <p className="text-[var(--color-text-main)]">{mostCaptured.nombre_comun}</p>
                  <p className="text-[var(--color-text-main)]/70 italic text-sm">
                    ({mostCaptured.nombre_cientifico})
                  </p>
                </div>
              ) : (
                <p className="text-[var(--color-text-main)]">—</p>
              )}
            </div>
            <div className="flex justify-start items-center gap-2 flex-wrap">
              <p className="font-medium text-[var(--color-text-main)]">Especies capturadas:</p>
              <p className="text-[var(--color-text-main)]">
                {distinctSpecies}/{totalSpecies}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}

export default Profile;
