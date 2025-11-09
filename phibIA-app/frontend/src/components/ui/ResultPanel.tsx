import {useEffect, useState} from "react";
import logo from "../../assets/singleLogo.png";
import specieShadow1 from "../../assets/speciesShadow/RhinellaArenarumShadow1.png";
import specie1 from "../../assets/species/RhinellaArenarum1.png";
import specieShadow2 from "../../assets/speciesShadow/OdontophrynusAsperShadow2.png";
import specie2 from "../../assets/species/OdontophrynusAsper2.png";
import specieShadow3 from "../../assets/speciesShadow/BoanaPulchellaShadow3.png";
import specie3 from "../../assets/species/BoanaPulchella3.png";
import specieShadow4 from "../../assets/speciesShadow/CeratophrysCranwelliShadow4.png";
import specie4 from "../../assets/species/CeratophrysCranwelli4.png";
import specieShadow5 from "../../assets/speciesShadow/LeptodactylusGracilisShadow5.png";
import specie5 from "../../assets/species/LeptodactylusGracilis5.png";
import specieShadow6 from "../../assets/speciesShadow/LeptodactylusLatinasusShadow6.png";
import specie6 from "../../assets/species/LeptodactylusLatinasus6.png";
import specieShadow7 from "../../assets/speciesShadow/LeptodactylusLuctatorShadow7.png";
import specie7 from "../../assets/species/LeptodactylusLuctator7.png";
import specieShadow8 from "../../assets/speciesShadow/LeptodactylusMystacinusShadow8.png";
import specie8 from "../../assets/species/LeptodactylusMystacinus8.png";
import specieShadow9 from "../../assets/speciesShadow/PleurodemaTucumanumShadow9.png";
import specie9 from "../../assets/species/PleurodemaTucumanum9.png";
import specieShadow10 from "../../assets/speciesShadow/ScinaxNasicusShadow10.png";
import specie10 from "../../assets/species/ScinaxNasicus10.png";
import specieShadow11 from "../../assets/speciesShadow/PhysalaemusBiligonigerus11Shadow.png";
import specie11 from "../../assets/species/PhysalaemusBiligonigerus11.png";


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
                    className={`w-30 md:w-50 h-auto absolute z-10 transition-opacity duration-1000 border${
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