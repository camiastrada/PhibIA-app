import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { API_URL } from '../config/api';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatar_id: number | null;
  background_color?: string;
  rol?: string;
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

  // Función para obtener datos del usuario desde el servidor
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        credentials: 'include'
      });

      if (response.ok) {
        setUser(await response.json());
        return;
      }

      // 401/422 = no hay sesión válida, el usuario es un invitado real.
      if (response.status === 401 || response.status === 422) {
        setUser(null);
        return;
      }

      // Cualquier otro status es un fallo del servidor, no una sesión expirada.
      console.error(
        `Error al obtener perfil: ${response.status} ${response.statusText}`
      );
    } catch (error) {
      // Error de red: la request no llegó al backend. No se marca como
      // invitado porque eso enmascara la causa (backend caído, API_URL mal
      // configurado, túnel sin conexión) y hace muy difícil diagnosticarla.
      console.error('Error de red al obtener perfil:', error);
    }
  }, []);

  const login = (userInfo: UserInfo) => {
    setUser(userInfo);
  };
  
  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include', // Incluir cookies HTTP-only
      });

      if (response.ok) {
        setUser(null); // Limpiar el estado del usuario
        window.location.href = "/login"; // Redirigir a la página de inicio
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