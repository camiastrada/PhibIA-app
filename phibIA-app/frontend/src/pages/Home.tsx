import { useState, useEffect, useRef } from "react";
import "../styles/App.css";
import logo from "../assets/singleLogo.png";
import specie1 from"../assets/speciesShadow/RhinellaArenarumShadow1.png";
import specie3 from"../assets/speciesShadow/BoanaPulchellaShadow3.png";
import specie2 from"../assets/speciesShadow/OdontophrynusAsperShadow2.png";

function Home() {
  const [listening, setListening] = useState(false);
  const [actualShadow, setActualShadow] = useState(specie1);
  const shadowsList = [specie1, specie2, specie3];

  // Refs para evitar race conditions y re-renders innecesarios
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [predictedSpecies, setPredictedSpecies] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const changeShadow = () => {
    setActualShadow((prev) => {
      const currentIndex = shadowsList.indexOf(prev);
      const nextIndex = (currentIndex + 1) % shadowsList.length;
      return shadowsList[nextIndex];
    });
  };

  useEffect(() => {
    if (!listening) return;
    const id = setInterval(changeShadow, 500);
    return () => clearInterval(id);
  }, [listening]);

  // Iniciar grabación
  const startRecording = async () => {
    setError(null);
    setPredictedSpecies(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const options: any = {};
      // Si necesitas forzar mimeType puedes usar: options.mimeType = 'audio/webm';
      const recorder = new MediaRecorder(stream as MediaStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const mime = chunksRef.current[0]?.type || "audio/webm";
          const ext = mime.includes("webm") ? "webm" : mime.includes("wav") ? "wav" : "audio";
          const blob = new Blob(chunksRef.current, { type: mime });

          // preparar FormData con la clave que el backend espera: 'audio'
          const formData = new FormData();
          formData.append("audio", blob, `recording_${Date.now()}.${ext}`);

          // enviar al backend
          const res = await fetch("http://localhost:5000/predict", {
            method: "POST",
            body: formData,
          });

          const data = await res.json().catch(() => null);
          if (!res.ok) {
            setError((data && data.error) || `Error del servidor: ${res.status}`);
          } else {
            // backend devuelve { prediccion: 'Nombre' }
            setPredictedSpecies(data?.prediccion ?? data?.prediction ?? data?.species ?? "No detectada");
          }
        } catch (err: any) {
          setError(err?.message || String(err));
        } finally {
          // limpiar y detener stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
          mediaRecorderRef.current = null;
          chunksRef.current = [];
          setListening(false);
        }
      };

      recorder.start();
      setListening(true);

    } catch (err: any) {
      setError("No se pudo acceder al micrófono: " + (err?.message || err));
    }
  };

  // Detener grabación
  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    // forzar envío de datos pendientes si el navegador lo soporta
    try {
      if (typeof (recorder as any).requestData === "function") {
        (recorder as any).requestData();
      }
    } catch (e) {}

    if (recorder.state !== "inactive") {
      recorder.stop();
    } else {
      // seguridad: detener stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      mediaRecorderRef.current = null;
      setListening(false);
    }
  };

  return (
    <div className="flex flex-col justify-around items-center h-7/10 w-4/5 bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl">
      <div id="titleSection">
        <h1 className="text-5xl font-bold mb-6 text-[#43A047]">¡Comienza a grabar!</h1> {/* 02372E*/}
        <p style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center', paddingLeft: '2.5rem', paddingRight: '2.5rem', fontFamily: 'sans-serif', fontWeight: 400 }}>
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
          <p style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center', paddingLeft: '2.5rem', paddingRight: '2.5rem', fontFamily: 'sans-serif', fontWeight: 400 }}>
            Comienza a grabar para obtener resultados
          </p>
      </div>

      <div id="buttonsSection" className="flex flex-col justify-around items-center">
        <button type="button" onClick={listening ? stopRecording : startRecording} className="flex flex-row justify-center bg-[#43A047] w-60 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl text-lg font-semibold hover:bg-[#357a38] transition-colors duration-200">
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            </>
          )}
        </button>
        <a href="/home/import" className="mt-4 text-[#004D40] hover:text-[#02372E] flex flex-row justify-center items-center">
          Importar grabación
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 inline-block ml-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </a>

        {/* mostrar predicción o error */}
        <div className="mt-4 text-center">
          {predictedSpecies && <p className="text-lg font-semibold text-[#004D40]">Predicción: {predictedSpecies}</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
        </div>

      </div>

      
    </div>
  );
}

export default Home;
