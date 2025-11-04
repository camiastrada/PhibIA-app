import "../styles/App.css";
import {useEffect, useState} from "react";
import ProfilePanel from "../components/ui/ProfilePanel";
import EditIcon from "../assets/uiIcons/editIcon";



function Login() {
  const [username, setUsername] = useState<String>("Lucas");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log("TOKEN: ", token);

        const response = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Error al obtener perfil");

        const data = await response.json();
        setUsername(data.name); 
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, []);
  return (
    <div className="flex flex-col lg:flex-row justify-center items-center md:min-h-4/5 md:w-4/5 w-full bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4">
      
      <div className="flex flex-col w-full lg:w-1/2 items-center justify-center">
        <div className="rounded-full size-50 relative">
          <ProfilePanel size="size-50"/>
          <button type="button" className="absolute right-2 top-2 shadow-xl bg-white rounded-full size-10 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110">
            <EditIcon/>
          </button>
        </div>

        <p className="text-lg font-medium mt-2"> {username} </p>
      </div>

      <div className="hidden lg:flex flex-col w-1/2 items-center justify-center">
      
      </div>
    </div>
  );
}

export default Login;
