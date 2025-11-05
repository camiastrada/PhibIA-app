import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  avatar_id: number | null;
  background_color?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateAvatar: (avatar_id: number) => void;
  logout: () => void; 
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setUser(data);
    };
    fetchProfile();
  }, []);

  const updateAvatar = (avatar_id: number) => {
    if (!user) return;
    setUser({ ...user, avatar_id });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateAvatar, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de un <UserProvider>");
  return context;
}
