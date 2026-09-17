import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import type { User, AuthResponse, ApiResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pravah_token');
    const savedUser = localStorage.getItem('pravah_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    const { token: newToken, user: newUser } = res.data.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('pravah_token', newToken);
    localStorage.setItem('pravah_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pravah_token');
    localStorage.removeItem('pravah_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
