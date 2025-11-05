import { createContext, useContext, useState, type ReactNode } from 'react';

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
  login: (token: string, user: UserInfo | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken');
  });
  const [user, setUser] = useState<UserInfo | null>(() => {
    const userData = localStorage.getItem('authUser');
    return userData ? JSON.parse(userData) : null;
  });

  const login = (token: string, userInfo: UserInfo | null) => {
    setToken(token);
    setUser(userInfo);
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userInfo));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const updateAvatar = (avatar_id: number) => {
    if (!user) return;
    const updatedUser = { ...user, avatar_id };
    setUser(updatedUser);
    localStorage.setItem("authUser", JSON.stringify(updatedUser));
  };


  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};