import { createContext, useContext, useState, type ReactNode } from 'react';

interface UserInfo {
  id?: number;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  login: (user: UserInfo | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);

  const login = (userInfo: UserInfo | null) => {
    setUser(userInfo);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};