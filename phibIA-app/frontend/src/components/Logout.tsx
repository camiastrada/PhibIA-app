import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Logout() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // limpiar token/usuario en memoria y redirigir al login
    auth.logout();
    navigate('/login');
  }, []);

  return null;
}
