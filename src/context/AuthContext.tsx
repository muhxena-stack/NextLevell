// src/context/AuthContext.tsx - COMPLETE FIXED VERSION
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';
import { authKeychain } from '../security/authKeychain';
import { authStorage } from '../storage/authStorage';
import { hybridStorageService } from '../storage/hybridStorageService';
import { appInitService } from '../storage/appInitService';
import { storageService } from '../storage/storageService';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { keychainService } from '../security/keychainService';
import { imageStorage } from '../storage/imageStorage';
import { User } from '../types/types';
import { biometricService } from '../security/biometricService';
import { BiometricUtils } from '../security/biometricUtils';

interface AuthContextType {
  user: User | null;
  userID: string;
  isLoading: boolean;
  keychainError: string | null;
  keychainStatus: {
    canSave: boolean;
    supported: boolean;
    servicesCount: number;
  } | null;
  
  biometricSupported: boolean;
  biometricType: string;
  isBiometricLocked: boolean;
  
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearKeychainError: () => void;
  checkKeychainStatus: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  
  loginWithBiometric: () => Promise<boolean>;
  checkBiometricAvailability: () => Promise<void>;
  clearBiometricLock: () => void;
  
  updateUserAvatar: (avatarUrl: string, base64?: string) => Promise<void>;
  removeUserAvatar: () => Promise<void>;
  getAvatarPreview: () => string | null;
  
  isAuthenticated: boolean;
  hasSecureStorage: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userID, setUserID] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [keychainError, setKeychainError] = useState<string | null>(null);
  const [keychainStatus, setKeychainStatus] = useState<{
    canSave: boolean;
    supported: boolean;
    servicesCount: number;
  } | null>(null);

  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);

  // Check biometric on app start
  useEffect(() => {
    const checkBiometricOnStart = async () => {
      try {
        console.log('🔐 Checking biometric availability on app start...');
        await checkBiometricAvailability();
      } catch (error) {
        console.error('❌ Error checking biometric on start:', error);
      }
    };

    checkBiometricOnStart();
  }, []);

  const checkBiometricAvailability = async (): Promise<void> => {
    try {
      const biometricInfo = await biometricService.getBiometricInfo();
      setBiometricSupported(biometricInfo.supported);
      setBiometricType(biometricInfo.type);
      
      console.log('📊 Biometric status:', biometricInfo);
    } catch (error) {
      console.error('❌ Error checking biometric availability:', error);
      setBiometricSupported(false);
      setBiometricType('');
    }
  };

  const loginWithBiometric = async (): Promise<boolean> => {
    try {
      console.log('🔐 Starting biometric login...');

      if (!biometricSupported) {
        Alert.alert(
          'Biometrik Tidak Tersedia',
          'Fitur biometrik tidak tersedia di perangkat ini.'
        );
        return false;
      }

      const success = await biometricService.loginWithBiometric();
      
      if (success) {
        // Get credentials from Keychain after biometric success
        const { token, userId } = await authKeychain.getAuthToken();
        
        if (token && userId) {
          const userData = await storageService.getItem<User>(STORAGE_KEYS.USER_DATA);
          
          if (userData) {
            const avatarBase64 = await imageStorage.getAvatarBase64();
            const userWithAvatar = {
              ...userData,
              avatarBase64: avatarBase64 || userData.avatarBase64
            };
            
            setUser(userWithAvatar);
            setUserID(userId);
            
            console.log('✅ Biometric login successful');
            Alert.alert('Berhasil', 'Login dengan biometrik berhasil!');
            return true;
          }
        }
        
        Alert.alert('Info', 'Tidak ada data login tersimpan. Silakan login manual terlebih dahulu.');
        return false;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ Biometric login error:', error);
      
      if (error.message === 'BIOMETRIC_LOCKOUT') {
        setIsBiometricLocked(true);
        BiometricUtils.handleBiometricLockout();
        await logout();
        return false;
      }
      
      Alert.alert('Login Gagal', 'Autentikasi biometrik tidak berhasil.');
      return false;
    }
  };

  const clearBiometricLock = (): void => {
    setIsBiometricLocked(false);
    console.log('🔓 Biometric lock cleared');
  };

  const checkKeychainStatus = async (): Promise<void> => {
    try {
      const status = await keychainService.getKeychainStatus();
      setKeychainStatus(status);
      
      console.log('🔐 Keychain Status:', {
        supported: status.supported,
        canSave: status.canSave,
        servicesCount: status.servicesCount
      });

      if (!status.supported) {
        console.warn('⚠️ Keychain not supported on this device');
        Alert.alert(
          'Peringatan Keamanan',
          'Penyimpanan aman tidak didukung di perangkat ini. Beberapa fitur keamanan mungkin tidak tersedia.',
          [{ text: 'Mengerti' }]
        );
      }
    } catch (error) {
      console.error('❌ Error checking keychain status:', error);
      setKeychainStatus({
        canSave: false,
        supported: false,
        servicesCount: 0
      });
    }
  };

  // Initialize auth on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setKeychainError(null);

        console.log('🚀 Starting authentication initialization...');

        await checkKeychainStatus();

        const initResult = await appInitService.initializeApp();

        console.log('📊 App Initialization Result:', {
          isAuthenticated: initResult.isAuthenticated,
          hasTheme: initResult.hasThemePreference,
          hasCart: initResult.hasCartItems,
          keychainError: initResult.keychainError,
          loadTime: initResult.loadTime
        });

        if (initResult.keychainError) {
          setKeychainError('KEYCHAIN_ACCESS_DENIED');
          console.error('🔐 Keychain access denied - security changed');
          
          await authKeychain.clearAuthToken();
          Alert.alert(
            'Keamanan Perangkat Diubah',
            'Mohon login ulang untuk keamanan akun Anda.',
            [{ text: 'OK', onPress: () => setKeychainError(null) }]
          );
          return;
        }

        if (initResult.hybridData.authToken && initResult.hybridData.userId) {
          console.log('🔐 Token found in Keychain, attempting auto-login...');
          
          const userData = await storageService.getItem<User>(STORAGE_KEYS.USER_DATA);
          if (userData) {
            const avatarBase64 = await imageStorage.getAvatarBase64();
            const userWithAvatar = {
              ...userData,
              avatarBase64: avatarBase64 || userData.avatarBase64
            };
            
            setUser(userWithAvatar);
            setUserID(initResult.hybridData.userId);
            console.log('✅ Auto-login successful from Hybrid Storage');
          } else {
            console.warn('⚠️ Token exists but user data not found in AsyncStorage');
            await authKeychain.clearAuthToken();
          }
        } else {
          console.log('🔐 No auth token found in Keychain');
        }

        console.log(`🚀 Auth initialization completed in ${initResult.loadTime}ms`);
        
      } catch (error: any) {
        console.error('❌ Error initializing auth:', error);
        
        if (error.message === 'KEYCHAIN_ACCESS_DENIED') {
          setKeychainError('KEYCHAIN_ACCESS_DENIED');
          Alert.alert(
            'Keamanan Perangkat Diubah',
            'Mohon login ulang untuk keamanan akun Anda.',
            [{ text: 'OK' }]
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 AuthContext login attempt:', { username });
      
      if (!username || !password) {
        Alert.alert('Error', 'Username dan password harus diisi');
        return false;
      }

      console.log('🔄 Simulating API login...');
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));

      const existingAvatarBase64 = await imageStorage.getAvatarBase64();
      
      const newUser: User = {
        id: 'user_' + Date.now(),
        nama: username,
        email: `${username}@example.com`,
        avatar: `https://ui-avatars.com/api/?name=${username}&background=007AFF&color=fff`,
        avatarBase64: existingAvatarBase64 || undefined
      };
      
      const fakeToken = 'jwt_simulated_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      console.log('💾 Saving token to Keychain...');
      const keychainSuccess = await authKeychain.saveAuthToken(fakeToken, newUser.id);
      
      if (!keychainSuccess) {
        throw new Error('Failed to save token to secure storage');
      }

      console.log('💾 Saving user data to AsyncStorage...');
      await storageService.setItem(STORAGE_KEYS.USER_DATA, newUser);
      
      setUser(newUser);
      setUserID(newUser.id);
      setKeychainError(null);
      
      await checkKeychainStatus();
      
      console.log('✅ Login success - token saved to Keychain');
      
      Alert.alert('Login Berhasil', `Selamat datang, ${username}!`, [
        { text: 'OK' }
      ]);
      
      return true;
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      let errorMessage = 'Terjadi kesalahan saat login';
      
      if (error.message.includes('Keychain') || error.message.includes('secure')) {
        errorMessage = 'Gagal menyimpan token ke penyimpanan aman. Periksa pengaturan keamanan perangkat Anda.';
      }
      
      Alert.alert('Login Gagal', errorMessage);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🔓 Starting secure logout process...');
      
      const cleanupTasks: Promise<unknown>[] = [
        authKeychain.clearAuthToken().then(success => {
          console.log(success ? '✅ Keychain cleared' : '❌ Keychain clear failed');
          return success;
        }),
        
        authStorage.clearAuthData().then(() => {
          console.log('✅ AsyncStorage cleared');
          return true;
        }),
        
        imageStorage.clearAvatarBase64().then(() => {
          console.log('✅ Avatar base64 cleared');
          return true;
        })
      ];

      await Promise.all(cleanupTasks);

      setUser(null);
      setUserID('');
      setKeychainError(null);
      
      console.log('🔓 Logout completed - all secure data cleared');
      
      Alert.alert('Logout Berhasil', 'Anda telah logout dari aplikasi.', [
        { text: 'OK' }
      ]);
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      setUser(null);
      setUserID('');
      
      Alert.alert(
        'Peringatan', 
        'Terjadi kesalahan saat logout, tetapi sesi lokal telah direset.',
        [{ text: 'OK' }]
      );
      
      throw error;
    }
  };

  const updateUserAvatar = async (avatarUrl: string, base64?: string): Promise<void> => {
    try {
      console.log('🔄 Updating user avatar...');
      
      const updatedUser: User = {
        ...user!,
        avatar: avatarUrl,
        avatarBase64: base64,
        lastAvatarUpdate: Date.now()
      };

      setUser(updatedUser);
      
      await storageService.setItem(STORAGE_KEYS.USER_DATA, updatedUser);
      
      if (base64) {
        await imageStorage.saveAvatarBase64(base64);
      }
      
      console.log('✅ Avatar updated successfully');
    } catch (error) {
      console.error('❌ Error updating avatar:', error);
      throw new Error('Gagal mengupdate avatar');
    }
  };

  const removeUserAvatar = async (): Promise<void> => {
    try {
      console.log('🔄 Removing user avatar...');
      
      const updatedUser: User = {
        ...user!,
        avatar: undefined,
        avatarBase64: undefined
      };

      setUser(updatedUser);
      
      await storageService.setItem(STORAGE_KEYS.USER_DATA, updatedUser);
      
      await imageStorage.clearAvatarBase64();
      
      console.log('✅ Avatar removed successfully');
    } catch (error) {
      console.error('❌ Error removing avatar:', error);
      throw new Error('Gagal menghapus avatar');
    }
  };

  const getAvatarPreview = (): string | null => {
    return user?.avatarBase64 || null;
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refreshing authentication status...');
      
      const { token, userId } = await authKeychain.getAuthToken();
      
      if (token && userId) {
        const userData = await storageService.getItem<User>(STORAGE_KEYS.USER_DATA);
        if (userData) {
          const avatarBase64 = await imageStorage.getAvatarBase64();
          const userWithAvatar = {
            ...userData,
            avatarBase64: avatarBase64 || userData.avatarBase64
          };
          
          setUser(userWithAvatar);
          setUserID(userId);
          console.log('✅ Auth refresh successful');
          return true;
        }
      }
      
      setUser(null);
      setUserID('');
      console.log('🔐 No valid authentication found during refresh');
      return false;
      
    } catch (error: any) {
      if (error.message === 'KEYCHAIN_ACCESS_DENIED') {
        setKeychainError('KEYCHAIN_ACCESS_DENIED');
        await logout();
      }
      console.error('❌ Auth refresh error:', error);
      return false;
    }
  };

  const clearKeychainError = (): void => {
    setKeychainError(null);
  };

  const isAuthenticated = !!user && !!userID;
  const hasSecureStorage = keychainStatus?.supported ?? false;

  const value: AuthContextType = {
    user,
    userID,
    isLoading,
    keychainError,
    keychainStatus,
    
    biometricSupported,
    biometricType,
    isBiometricLocked,
    
    login,
    logout,
    clearKeychainError,
    checkKeychainStatus,
    refreshAuth,
    
    loginWithBiometric,
    checkBiometricAvailability,
    clearBiometricLock,
    
    updateUserAvatar,
    removeUserAvatar,
    getAvatarPreview,
    
    isAuthenticated,
    hasSecureStorage
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

export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, hasSecureStorage } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    hasSecureStorage,
    canProceed: !isLoading,
    requiresSecureStorage: isAuthenticated && !hasSecureStorage
  };
};