// src/context/AuthContext.tsx - UPDATE
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { authStorage } from '../storage/authStorage';
import { appInitService } from '../storage/appInitService';

interface User {
  id: string;
  nama: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>; // ✅ Diubah jadi async
  userID: string;
  isLoading: boolean; // ✅ Tambah loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userID, setUserID] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true); // ✅ Loading state

  // ✅ Tugas a: Check token saat app start untuk guard flow
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const appData = await appInitService.loadInitialData();
        
        if (appData.authToken && appData.userData) {
          setUser(appData.userData);
          setUserID(appData.userData.id);
          console.log('✅ Auto-login from storage');
        } else {
          console.log('🔐 No valid auth data in storage');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 AuthContext login attempt:', { username, password });
      
      // Simulasi login sederhana
      if (username && password) {
        const newUser: User = {
          id: '1',
          nama: username,
          email: `${username}@example.com`
        };
        
        const fakeToken = 'simulated_token_' + Date.now();
        
        // ✅ Tugas a: Simpan auth data ke storage
        await authStorage.saveAuthData(fakeToken, newUser);
        
        setUser(newUser);
        setUserID('U123');
        console.log('✅ AuthContext login success - data saved to storage');
        return true;
      }
      
      console.log('❌ AuthContext login failed - missing credentials');
      return false;
    } catch (error) {
      console.error('❌ AuthContext login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // ✅ Tugas e: Clear semua data sensitif
      await authStorage.clearAuthData();
      
      setUser(null);
      setUserID('');
      console.log('🔓 AuthContext logout - storage cleared');
    } catch (error) {
      console.error('❌ AuthContext logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    userID,
    isLoading // ✅ Expose loading state
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