import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../styles/App.css";
import logo from "../assets/singleLogo.png";
import specie1 from "../assets/speciesShadow/RhinellaArenarumShadow1.png";
import specie2 from "../assets/speciesShadow/OdontophrynusAsperShadow2.png";
import specie3 from "../assets/speciesShadow/BoanaPulchellaShadow3.png";
import specie4 from "../assets/speciesShadow/CeratophrysCranwelliShadow4.png";
import specie5 from "../assets/speciesShadow/LeptodactylusGracilisShadow5.png";

function Home() {
  const [listening, setListening] = useState(false);
  const [_isImport, setIsImport] = useState(false);
  const [actualShadow, setActualShadow] = useState(specie1);
  const shadowsList = [specie1, specie2, specie3, specie4, specie5];

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
    if (!listening) return () => stopRecording();
    const id = setInterval(changeShadow, 500);
    startRecording();
    return () => {clearInterval(id)};
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
    <div className="flex-col justify-around items-center w-9/10 md:w-4/5 bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl p-4">
      <div id="titleSection">
        <h1 className="text-5xl font-bold mb-6 text-[#43A047]">
          ¡Comienza a grabar!
        </h1>{" "}
        {/* 02372E*/}
        <p className="text-xl mb-4 text-center px-10 font-normal font-sans">
          Acercate al anfibio y graba su canto para detectar su especie
        </p>
      </div>
      <div
        id="panelSection "
        className="flex flex-col justify-around gap-6 items-center"
      >
        <div
          id="panel"
          className="bg-[#004D40] rounded-full size-60 flex justify-center items-center"
        >
          {listening ? (
            <img
              src={actualShadow}
              alt="Species Shadow"
              className="w-50 h-auto"
            />
          ) : (
            <img src={logo} alt="Logo" className="w-60 h-auto" />
          )}
        </div>
        {listening ? (
          <p> Escuchando... </p>
        ) : (
          <p>Comienza a grabar para obtener resultados</p>
        )}
      </div>

      <div
        id="buttonsSection"
        className="flex flex-col justify-around items-center"
      >
        <button
          type="button"
          onClick={() => {
            setListenig(!listening);
            setIsImport(false);
          }}
          className={`flex flex-row justify-center cursor-pointer ${
            listening
              ? "bg-transparent text-red-600 animate-pulse"
              : "bg-[#43A047] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#357a38] text-white w-60 px-6 py-3 text-lg font-semibold"
          }`}
        >
          {listening ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-15"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
                />
              </svg>
            </>
          ) : (
            <>
              <p>Grabar</p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            </>
          )}
        </button>

        <Link to="/upload">
          <button
            type="button"
            onClick={() => {
              setIsImport(true);
              setListenig(false);
            }}
            className={`mt-4 text-[#004D40] hover:text-[#02372E] flex-row justify-center items-center ${
              listening ? "hidden" : "flex"
            }`}
          >
            Importar grabación
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="size-4 inline-block ml-1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
