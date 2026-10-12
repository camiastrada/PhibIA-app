import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TextField from "../components/TextField.tsx";
import { API_URL } from "../config/api";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PASSWORD_REQUIREMENTS_MESSAGE =
  "La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("El enlace no es válido");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo restablecer la contraseña");
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen relative px-4 bg-[#152C28]">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 relative z-10">
        <h1 className="text-xl font-extrabold text-center text-(--color-text-main) mb-1">
          PhibIA
        </h1>
        <h2 className="text-2xl font-bold mb-4 text-center text-(--color-text-main)">
          Nueva contraseña
        </h2>

        {!token ? (
          <p className="text-sm text-red-600 text-center">
            El enlace no es válido. Pedí uno nuevo desde{" "}
            <Link to="/forgot-password" className="text-blue-500">
              acá
            </Link>
            .
          </p>
        ) : success ? (
          <p className="text-sm text-slate-600 text-center">
            Contraseña actualizada. Te redirigimos al login...
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              type="password"
              placeholder="Contraseña nueva"
              color="var(--color-text-main)"
              name="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
            <TextField
              type="password"
              placeholder="Confirmar contraseña"
              color="var(--color-text-main)"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
            />
            <p className="text-xs text-slate-500 mb-2">
              Mínimo 8 caracteres, con al menos una letra y un número
            </p>

            {error && (
              <p className="text-sm text-red-600 mb-2 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#43a047] text-white py-2 rounded-lg hover:bg-[#388e3c] transition cursor-pointer mt-2"
            >
              {loading ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
