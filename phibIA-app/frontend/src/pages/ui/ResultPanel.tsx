import {useEffect, useState} from "react";
import logo from "../../assets/singleLogo.png";
import specie1 from "../../assets/speciesShadow/RhinellaArenarumShadow1.png";
import specie2 from "../../assets/speciesShadow/OdontophrynusAsperShadow2.png";
import specie3 from "../../assets/speciesShadow/BoanaPulchellaShadow3.png";
import specie4 from "../../assets/speciesShadow/CeratophrysCranwelliShadow4.png";
import specie5 from "../../assets/speciesShadow/LeptodactylusGracilisShadow5.png";

interface Params{
  listening: boolean;
  prediction: boolean;
  specie?: string; 
}
export default function ResultPanel({listening, prediction , specie} : Params){
    const [actualShadow, setActualShadow] = useState(specie1);
    const shadowsList = [specie1, specie2, specie3, specie4, specie5];

    console.log(specie)

    const changeShadow = () => {
        setActualShadow((prev) => {
            const currentIndex = shadowsList.indexOf(prev);
            const nextIndex = (currentIndex + 1) % shadowsList.length;
            return shadowsList[nextIndex];
        });
    };

    useEffect(() => {
      if (!listening) return;

      if (prediction && specie) {
        const index = parseInt(specie) - 1;
        if (index >= 0 && index < shadowsList.length) {
          setActualShadow(shadowsList[index]);
        }
        return; // 👈 Esto corta el efecto antes de crear el intervalo
      }

      const id = setInterval(changeShadow, 500);
      return () => clearInterval(id);
    }, [listening, prediction, specie]);



    return(
        <div
          id="panelSection "
          className="flex flex-col justify-around gap-6 items-center mb-6"
        >
          <div
            id="panel"
            className="bg-[#004D40] rounded-full size-40 md:size-60 flex justify-center items-center"
          >
            {listening || prediction ? (
              <img
                src={actualShadow}
                alt="Species Shadow"
                className="w-30 md:w-50 h-auto"
              />
            ) : (
              <img src={logo} alt="Logo" className="w-60 h-auto" />
            )}
          </div>
          {listening ? (
            <p className="text-md"> Escuchando... </p>
          ) : (
            <p className="text-md">Comienza a grabar para obtener resultados</p>
          )}
        </div>
    )
}