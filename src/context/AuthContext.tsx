// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  nama: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  userID: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userID, setUserID] = useState<string>('');

  const login = (email: string, password: string): boolean => {
    if (email && password) {
      setUser({
        id: '1',
        nama: email.split('@')[0],
        email: email
      });
      setUserID('U123');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setUserID('');
  };

  const value = {
    user,
    login,
    logout,
    userID
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};