import { useNavigate } from "react-router-dom";

export default function FrogsBullsButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/add-photo")}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg z-20"
    >
      Ranas Toros
    </button>
  );
}
