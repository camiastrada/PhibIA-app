import { useNavigate } from "react-router-dom";
import FrogsMap from "../components/FrogsMap";

export default function Maps() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <button onClick={() => navigate(-1)}>← Volver</button>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <FrogsMap />
      </div>
    </div>
  );
}
