// src/context/AuthContext.tsx - UPDATED WITH AVATAR SUPPORT
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
import { User, SimpleImageAsset } from '../types/types';

// Auth context type - UPDATED
interface AuthContextType {
  // State
  user: User | null;
  userID: string;
  isLoading: boolean;
  keychainError: string | null;
  keychainStatus: {
    canSave: boolean;
    supported: boolean;
    servicesCount: number;
  } | null;
  
  // Methods
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearKeychainError: () => void;
  checkKeychainStatus: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  
  // 🆕 NEW: Avatar methods
  updateUserAvatar: (avatarUrl: string, base64?: string) => Promise<void>;
  removeUserAvatar: () => Promise<void>;
  getAvatarPreview: () => string | null;
  
  // Status
  isAuthenticated: boolean;
  hasSecureStorage: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
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

  // ✅ Check keychain status
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

  // ✅ Initialize auth
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setKeychainError(null);

        console.log('🚀 Starting authentication initialization...');

        // ✅ Check keychain status terlebih dahulu
        await checkKeychainStatus();

        // ✅ Gunakan AppInitService untuk hybrid loading
        const initResult = await appInitService.initializeApp();

        console.log('📊 App Initialization Result:', {
          isAuthenticated: initResult.isAuthenticated,
          hasTheme: initResult.hasThemePreference,
          hasCart: initResult.hasCartItems,
          keychainError: initResult.keychainError,
          loadTime: initResult.loadTime
        });

        // ✅ Handle keychain access denied
        if (initResult.keychainError) {
          setKeychainError('KEYCHAIN_ACCESS_DENIED');
          console.error('🔐 Keychain access denied - security changed');
          
          // Reset token dan force login
          await authKeychain.clearAuthToken();
          Alert.alert(
            'Keamanan Perangkat Diubah',
            'Mohon login ulang untuk keamanan akun Anda.',
            [{ text: 'OK', onPress: () => setKeychainError(null) }]
          );
          return;
        }

        // ✅ Gunakan data dari hybrid storage untuk auto-login
        if (initResult.hybridData.authToken && initResult.hybridData.userId) {
          console.log('🔐 Token found in Keychain, attempting auto-login...');
          
          const userData = await storageService.getItem<User>(STORAGE_KEYS.USER_DATA);
          if (userData) {
            // 🆕 NEW: Load avatar base64 dari image storage
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
            // Clear inconsistent state
            await authKeychain.clearAuthToken();
          }
        } else {
          console.log('🔐 No auth token found in Keychain');
        }

        console.log(`🚀 Auth initialization completed in ${initResult.loadTime}ms`);
        
      } catch (error: any) {
        console.error('❌ Error initializing auth:', error);
        
        // Handle specific keychain errors
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

  // ✅ Login function dengan Keychain integration
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 AuthContext login attempt:', { username });
      
      if (!username || !password) {
        Alert.alert('Error', 'Username dan password harus diisi');
        return false;
      }

      // Simulasi API call login
      console.log('🔄 Simulating API login...');
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));

      // 🆕 NEW: Load existing avatar base64
      const existingAvatarBase64 = await imageStorage.getAvatarBase64();
      
      const newUser: User = {
        id: 'user_' + Date.now(),
        nama: username,
        email: `${username}@example.com`,
        avatar: `https://ui-avatars.com/api/?name=${username}&background=007AFF&color=fff`,
        avatarBase64: existingAvatarBase64 || undefined
      };
      
      // Generate simulated JWT token
      const fakeToken = 'jwt_simulated_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // ✅ Simpan token ke Keychain
      console.log('💾 Saving token to Keychain...');
      const keychainSuccess = await authKeychain.saveAuthToken(fakeToken, newUser.id);
      
      if (!keychainSuccess) {
        throw new Error('Failed to save token to secure storage');
      }

      // ✅ Simpan user data non-sensitive ke AsyncStorage
      console.log('💾 Saving user data to AsyncStorage...');
      await storageService.setItem(STORAGE_KEYS.USER_DATA, newUser);
      
      // Update state
      setUser(newUser);
      setUserID(newUser.id);
      setKeychainError(null);
      
      // Update keychain status
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

  // ✅ Logout function dengan secure cleanup
  const logout = async (): Promise<void> => {
    try {
      console.log('🔓 Starting secure logout process...');
      
      // ✅ Pembersihan data aman - Keychain + AsyncStorage + Image Data
      const cleanupTasks: Promise<unknown>[] = [
        // ✅ Hapus dari Keychain (secure storage)
        authKeychain.clearAuthToken().then(success => {
          console.log(success ? '✅ Keychain cleared' : '❌ Keychain clear failed');
          return success;
        }),
        
        // ✅ Hapus dari AsyncStorage (non-sensitive data)
        authStorage.clearAuthData().then(() => {
          console.log('✅ AsyncStorage cleared');
          return true;
        }),
        
        // 🆕 NEW: Hapus image data (avatar base64)
        imageStorage.clearAvatarBase64().then(() => {
          console.log('✅ Avatar base64 cleared');
          return true;
        })
      ];

      await Promise.all(cleanupTasks);

      // Reset state
      setUser(null);
      setUserID('');
      setKeychainError(null);
      
      console.log('🔓 Logout completed - all secure data cleared');
      
      Alert.alert('Logout Berhasil', 'Anda telah logout dari aplikasi.', [
        { text: 'OK' }
      ]);
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Even if there's an error, still reset the local state
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

  // 🆕 NEW: Update user avatar
  const updateUserAvatar = async (avatarUrl: string, base64?: string): Promise<void> => {
    try {
      console.log('🔄 Updating user avatar...');
      
      const updatedUser: User = {
        ...user!,
        avatar: avatarUrl,
        avatarBase64: base64,
        lastAvatarUpdate: Date.now()
      };

      // Update state
      setUser(updatedUser);
      
      // Update storage
      await storageService.setItem(STORAGE_KEYS.USER_DATA, updatedUser);
      
      // Save base64 untuk preview cepat
      if (base64) {
        await imageStorage.saveAvatarBase64(base64);
      }
      
      console.log('✅ Avatar updated successfully');
    } catch (error) {
      console.error('❌ Error updating avatar:', error);
      throw new Error('Gagal mengupdate avatar');
    }
  };

  // 🆕 NEW: Remove user avatar
  const removeUserAvatar = async (): Promise<void> => {
    try {
      console.log('🔄 Removing user avatar...');
      
      const updatedUser: User = {
        ...user!,
        avatar: undefined,
        avatarBase64: undefined
      };

      // Update state
      setUser(updatedUser);
      
      // Update storage
      await storageService.setItem(STORAGE_KEYS.USER_DATA, updatedUser);
      
      // Clear base64 dari image storage
      await imageStorage.clearAvatarBase64();
      
      console.log('✅ Avatar removed successfully');
    } catch (error) {
      console.error('❌ Error removing avatar:', error);
      throw new Error('Gagal menghapus avatar');
    }
  };

  // 🆕 NEW: Get avatar preview (base64)
  const getAvatarPreview = (): string | null => {
    return user?.avatarBase64 || null;
  };

  // ✅ Refresh auth status
  const refreshAuth = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refreshing authentication status...');
      
      const { token, userId } = await authKeychain.getAuthToken();
      
      if (token && userId) {
        const userData = await storageService.getItem<User>(STORAGE_KEYS.USER_DATA);
        if (userData) {
          // 🆕 NEW: Load avatar base64
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
      
      // No valid auth found
      setUser(null);
      setUserID('');
      console.log('🔐 No valid authentication found during refresh');
      return false;
      
    } catch (error: any) {
      if (error.message === 'KEYCHAIN_ACCESS_DENIED') {
        setKeychainError('KEYCHAIN_ACCESS_DENIED');
        await logout(); // Force logout on keychain access issues
      }
      console.error('❌ Auth refresh error:', error);
      return false;
    }
  };

  // ✅ Clear keychain error
  const clearKeychainError = (): void => {
    setKeychainError(null);
  };

  // ✅ Computed properties
  const isAuthenticated = !!user && !!userID;
  const hasSecureStorage = keychainStatus?.supported ?? false;

  const value: AuthContextType = {
    // State
    user,
    userID,
    isLoading,
    keychainError,
    keychainStatus,
    
    // Methods
    login,
    logout,
    clearKeychainError,
    checkKeychainStatus,
    refreshAuth,
    
    // 🆕 NEW: Avatar methods
    updateUserAvatar,
    removeUserAvatar,
    getAvatarPreview,
    
    // Status
    isAuthenticated,
    hasSecureStorage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook untuk menggunakan auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility hook untuk auth status checks
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