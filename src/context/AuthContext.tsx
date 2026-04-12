import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Tipos ---
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'professor' | 'aluno';
}

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
}

// --- Contexto ---
const AuthContext = createContext<AuthContextData | null>(null);

// --- Provider ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = (email: string, password: string): LoginResult => {
    if (email.trim() && password.trim()) {
      const mockUser: User = {
        id: 1,
        name: 'Administrador',
        email,
        role: 'admin',
      };
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: 'Credenciais inválidas.' };
  };

  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Hook customizado ---
export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
