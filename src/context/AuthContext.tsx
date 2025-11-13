// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  nama: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
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

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 AuthContext login attempt:', { username, password });
      
      // Simulasi login sederhana - selalu return success untuk testing
      if (username && password) {
        const newUser: User = {
          id: '1',
          nama: username,
          email: `${username}@example.com`
        };
        
        setUser(newUser);
        setUserID('U123');
        console.log('✅ AuthContext login success');
        return true;
      }
      
      console.log('❌ AuthContext login failed - missing credentials');
      return false;
    } catch (error) {
      console.error('❌ AuthContext login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setUserID('');
    console.log('🔓 AuthContext logout');
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