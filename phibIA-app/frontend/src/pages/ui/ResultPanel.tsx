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

interface Params{
  listening: boolean;
  prediction: boolean;
  specie?: string; 
}
export default function ResultPanel({listening, prediction , specie} : Params){
    const [actualShadow, setActualShadow] = useState(specieShadow1);
    const [actualSpecie, setActualSpecie] = useState(specie1);
    const [showSpecie, setShowSpecie] = useState(false);
    const [thinking, setThinking] = useState(false)
    const shadowsList = [specieShadow1, specieShadow2, specieShadow3, specieShadow4, specieShadow5];
    const speciesList = [specie1, specie2, specie3, specie4, specie5];
    

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
        </div>
    )
}