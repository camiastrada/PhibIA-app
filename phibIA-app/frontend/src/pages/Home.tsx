import "../styles/App.css";

function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-7/10 w-4/5 bg-white/85 border-2 border-white backdrop-blur-xs rounded-3xl">
      <h1 className="text-5xl font-bold mb-6 text-[#43A047]">¡Comienza a grabar!</h1> {/* 02372E*/}
      <p className="text-xl mb-4 text-center px-10 font-medium font-sans">
        Acercate al anfibio  y graba su canto para detectar su especie
      </p>

      
    </div>
  );
}

export default Home;
