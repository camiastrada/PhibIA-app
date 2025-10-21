import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DahboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import "./styles/App.css";
function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<DashboardLayout />}>
          <Route path="" element={<Home />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </Router>
  );
}

export default App;
