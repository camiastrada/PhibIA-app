import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DahboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import "./styles/App.css";
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
      </Routes>
    </Router>
  );
}

export default App;
