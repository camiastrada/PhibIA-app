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
import InfoFrog from "./pages/InfoFrog";
import Encyclopedia from "./pages/Encyclopedia";
import Galery from "./pages/Galery";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GaleryUsers from "./pages/GaleryUsers";

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
          <Route path="/encyclopedia" element={<Encyclopedia />} />
          <Route path="/encyclopedia/:specieNumber" element={<InfoFrog />} />
          <Route path="/galery" element={<Galery />} />
          <Route path="/galeryUsers" element={<GaleryUsers />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
