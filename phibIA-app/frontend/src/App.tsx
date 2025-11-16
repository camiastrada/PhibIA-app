import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DahboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import FrogsMap from "./pages/Maps";
import "./styles/App.css";
import FrogsBulls from "./pages/FrogsBulls";
import Detections from "./pages/Detections";
import InfoFrog from './pages/InfoFrog';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/captures" element={<Detections />} />
          <Route path="/add-photo" element={<FrogsBulls />} />
          <Route path="/map" element={<FrogsMap />} />
          <Route path="/encyclopedia/:specieNumber" element={<InfoFrog />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
