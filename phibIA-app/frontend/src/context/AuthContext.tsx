import { createContext, useContext, useState, type ReactNode } from 'react';

interface UserInfo {
  id?: number;
  name?: string;
  email?: string;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
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

  const login = (newToken: string, userInfo: UserInfo | null) => {
    setToken(newToken);
    setUser(userInfo);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userInfo));
  };
  
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
