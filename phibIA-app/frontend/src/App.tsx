import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DahboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import "./styles/App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import Upload from "./components/Upload";

function App() {
  const [_isImport, setIsImport] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Archivo seleccionado:", file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado");
  };

  return (
    <Router>
      <Routes>
        {/* Rutas protegidas: solo si hay sesión */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="" element={<Home />} />
        </Route>
        <Route path="/upload" 
        element={
          <ProtectedRoute>
            <Upload 
              handleFileChange={handleFileChange}
              handleSubmit={handleSubmit}
              setIsImport={setIsImport}
            />
          </ProtectedRoute>
        } 
        />

        {/* Rutas públicas: solo si NO hay sesión */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
