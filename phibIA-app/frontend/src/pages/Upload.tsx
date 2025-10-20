import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Por favor selecciona un archivo de audio");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.prediccion);
        setError(null);
      } else {
        setError(data.error || "Error en la predicción");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Subir Audio</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="w-full"
          />

          {file && (
            <p className="text-sm text-gray-600">
              Archivo: <span className="font-semibold">{file.name}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Procesando..." : "Enviar"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
            <p className="font-semibold">Resultado:</p>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
