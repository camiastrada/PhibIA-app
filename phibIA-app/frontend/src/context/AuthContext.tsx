import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatar_id: number | null;
  background_color?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  updateAvatar: (avatar_id: number) => void;
  updateBackgroundColor: (color: string) => void;
  login: (user: UserInfo) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

  // Función para obtener datos del usuario desde el servidor
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      setUser(null);
    }
  }, [BACKEND_URL]);

  const login = (userInfo: UserInfo) => {
    setUser(userInfo);
  };
  
  const logout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/logout`, {
        method: 'POST',
        credentials: 'include', // Incluir cookies HTTP-only
      });

      if (response.ok) {
        setUser(null); // Limpiar el estado del usuario
        window.location.href = "/"; // Redirigir a la página de inicio
      } else {
        console.error('Error al cerrar sesión:', await response.text());
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const updateAvatar = (avatar_id: number) => {
    if (!user) return;
    setUser({ ...user, avatar_id });
  };

  const updateBackgroundColor = (color: string) => {
    if (!user) return;
    setUser({ ...user, background_color: color });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateAvatar, updateBackgroundColor, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};