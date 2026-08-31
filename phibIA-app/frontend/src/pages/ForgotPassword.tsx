import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import TextField from "../components/TextField.tsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL ?? "/api";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Ingresá tu email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo procesar la solicitud");
        return;
      }
      setSent(true);
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-slate-100">
      <div className="w-full max-w-sm bg-white/90 rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold mb-4 text-center text-(--color-text-main)">
          Recuperar contraseña
        </h2>

        {sent ? (
          <div className="text-center">
            <p className="text-slate-600 mb-6">
              Si el email está registrado, te llegaron las instrucciones para
              restablecer tu contraseña. Revisá tu bandeja de entrada (y spam).
            </p>
            <Link
              to="/login"
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-slate-600 mb-4 text-center">
              Ingresá tu email y te mandamos instrucciones para restablecer tu
              contraseña.
            </p>

            <TextField
              type="email"
              placeholder="Correo electrónico"
              color="var(--color-text-main)"
              name="email"
              value={email}
              onChange={handleChange}
            />

            {error && (
              <p className="text-sm text-red-600 mb-2 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#43a047] text-white py-2 rounded-lg hover:bg-[#388e3c] transition cursor-pointer mt-2"
            >
              {loading ? "Enviando..." : "Enviar instrucciones"}
            </button>

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Volver al login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
