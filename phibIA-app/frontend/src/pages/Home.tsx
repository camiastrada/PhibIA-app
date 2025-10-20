import { useState, useEffect } from "react";
import "../styles/App.css";
import logo from "../assets/singleLogo.png";
import specie1 from"../assets/speciesShadow/RhinellaArenarumShadow1.png";
import specie2 from"../assets/speciesShadow/OdontophrynusAsperShadow2.png";
import specie3 from"../assets/speciesShadow/BoanaPulchellaShadow3.png";
import specie4 from"../assets/speciesShadow/CeratophrysCranwelliShadow4.png";

function Home() {
  const [listening, setListenig] = useState(false);
  const [actualShadow, setActualShadow] = useState(specie1);
  const shadowsList = [specie1, specie2, specie3, specie4];

  const changeShadow = () => {
    setActualShadow((prev) => {
      const currentIndex = shadowsList.indexOf(prev);
      const nextIndex = (currentIndex + 1) % shadowsList.length;
      return shadowsList[nextIndex];
    });
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (listening) {
      intervalId = setInterval(changeShadow, 500);
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [listening]);

  return (
    <div className="flex flex-col justify-around items-center h-7/10 w-4/5 bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl">
      <div id="titleSection">
        <h1 className="text-5xl font-bold mb-6 text-[#43A047]">¡Comienza a grabar!</h1> {/* 02372E*/}
        <p className="text-xl mb-4 text-center px-10 font-normal font-sans">
          Acercate al anfibio  y graba su canto para detectar su especie
        </p>
      </div>
      <div id="panelSection " className="flex flex-col justify-around gap-6 items-center"> 
          <div id="panel" className="bg-[#004D40] rounded-full size-60 flex justify-center items-center">
            {listening ? (
              <img src={actualShadow} alt="Species Shadow" className="w-50 h-auto" />
            ) : (
              <img src={logo} alt="Logo" className="w-60 h-auto" />
            )}
          </div>
          <p className="text-xl mb-4 text-center px-10 font-normal font-sans">
            Comienza a grabar para obtener resultados
          </p>
      </div>

      <div id="buttonsSection" className="flex flex-col justify-around items-center">
        <button type="button" onClick={() => setListenig(!listening)} className="flex flex-row justify-center bg-[#43A047] w-60 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl text-lg font-semibold hover:bg-[#357a38] transition-colors duration-200">
          {listening ? (
            <p>
              Escuchando ...
            </p>
          ):
          (
            <>
              <p>
                Grabar
              </p>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            </>
          )}
        </button>
        <a href="/home/import" className="mt-4 text-[#004D40] hover:text-[#02372E] flex flex-row justify-center items-center">
          Importar grabación
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4 inline-block ml-1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </a>
        
      </div>

      
    </div>
  );
}

export default Home;
