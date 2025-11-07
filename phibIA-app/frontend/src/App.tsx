import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DahboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import FrogsMap from "./pages/Maps";
import "./styles/App.css";
import FrogsBulls from "./pages/FrogsBulls";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/add-photo" element={<FrogsBulls />} />
        <Route path="/frogs-map" element={<FrogsMap />} />
      </Routes>
    </Router>
  );
}

export default App;
