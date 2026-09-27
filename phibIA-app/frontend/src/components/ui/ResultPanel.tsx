import {useEffect, useState} from "react";
import logo from "../../assets/singleLogo.webp";
import specieShadow1 from "../../assets/speciesShadow/RhinellaArenarumShadow1.webp";
import specie1 from "../../assets/species/RhinellaArenarum1.webp";
import specieShadow2 from "../../assets/speciesShadow/OdontophrynusAsperShadow2.webp";
import specie2 from "../../assets/species/OdontophrynusAsper2.webp";
import specieShadow3 from "../../assets/speciesShadow/BoanaPulchellaShadow3.webp";
import specie3 from "../../assets/species/BoanaPulchella3.webp";
import specieShadow4 from "../../assets/speciesShadow/CeratophrysCranwelliShadow4.webp";
import specie4 from "../../assets/species/CeratophrysCranwelli4.webp";
import specieShadow5 from "../../assets/speciesShadow/LeptodactylusGracilisShadow5.webp";
import specie5 from "../../assets/species/LeptodactylusGracilis5.webp";
import specieShadow6 from "../../assets/speciesShadow/LeptodactylusLatinasusShadow6.webp";
import specie6 from "../../assets/species/LeptodactylusLatinasus6.webp";
import specieShadow7 from "../../assets/speciesShadow/LeptodactylusLuctatorShadow7.webp";
import specie7 from "../../assets/species/LeptodactylusLuctator7.webp";
import specieShadow8 from "../../assets/speciesShadow/LeptodactylusMystacinusShadow8.webp";
import specie8 from "../../assets/species/LeptodactylusMystacinus8.webp";
import specieShadow9 from "../../assets/speciesShadow/PleurodemaTucumanumShadow9.webp";
import specie9 from "../../assets/species/PleurodemaTucumanum9.webp";
import specieShadow10 from "../../assets/speciesShadow/ScinaxNasicusShadow10.webp";
import specie10 from "../../assets/species/ScinaxNasicus10.webp";
import specieShadow11 from "../../assets/speciesShadow/PhysalaemusBiligonigerus11Shadow.webp";
import specie11 from "../../assets/species/PhysalaemusBiligonigerus11.webp";


interface Params{
  listening: boolean;
  prediction: boolean;
  specie?: string;
  confidence?: number | null;
}
export default function ResultPanel({listening, prediction , specie, confidence} : Params){
    const [actualShadow, setActualShadow] = useState(specieShadow1);
    const [actualSpecie, setActualSpecie] = useState(specie1);
    const [showSpecie, setShowSpecie] = useState(false);
    const [thinking, setThinking] = useState(false)
    const shadowsList = [specieShadow1, specieShadow2, specieShadow3, specieShadow4, specieShadow5, specieShadow6, specieShadow7, specieShadow8, specieShadow9, specieShadow10, specieShadow11];
    const speciesList = [specie1, specie2, specie3, specie4, specie5, specie6, specie7, specie8, specie9, specie10, specie11];
    

    const changeShadow = () => {
        setActualShadow((prev) => {
            const currentIndex = shadowsList.indexOf(prev);
            const nextIndex = (currentIndex + 1) % shadowsList.length;
            return shadowsList[nextIndex];
        });
    };

    useEffect(() => {
      if (!listening || prediction ) return;
      
      const id = setInterval(changeShadow, 500);
      setShowSpecie(false)
      setThinking(true)
      return () => clearInterval(id);
    }, [listening]);

    useEffect(() => {
      if (prediction && specie) {
        const index = parseInt(specie) - 1;
        if (index >= 0 && index < shadowsList.length) {
          setActualShadow(shadowsList[index]);
          setActualSpecie(speciesList[index]);
          setThinking(false)
          setShowSpecie(false);

          const timeout = setTimeout(() => {
            setShowSpecie(true);
          }, 1500);

          return () => clearTimeout(timeout);
        }
      }
    }, [prediction, specie]);


    return(
        <div
          id="panelSection "
          className="flex flex-col justify-around gap-6 items-center mb-6"
        >
          <div
            id="panel"
            className="bg-[#004D40] rounded-full size-40 md:size-60 flex justify-center items-center"
          >
            {listening || prediction || thinking ? (
                <div className="flex justify-center items-center">
                  <img
                    src={actualShadow}
                    alt="Species Shadow"
                    className={`w-30 md:w-50 h-auto absolute z-10 transition-opacity duration-1000 ${
                      showSpecie && !listening ? "opacity-0" : "opacity-100"
                    }`}
                    />
                  <img
                    src={showSpecie? actualSpecie : actualShadow}
                    alt="Specie"
                    className={`w-30 h-auto md:w-50 absolute transition-opacity duration-1000 ${
                      showSpecie && prediction? "opacity-100" : "opacity-0"
                    }`}
                    />
                </div> 
                
                ) : (
                  <img src={logo} alt="Logo" className="w-60 h-auto" />
                )
            }
          </div>
          
          {/* Mostrar confianza cuando hay predicción */}
          {prediction && confidence !== null && confidence !== undefined && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-[#004D40] text-lg md:text-xl font-semibold">
                Confianza: {confidence.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
    )
}