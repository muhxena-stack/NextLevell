// src/storage/appInitService.ts - UPDATED untuk Tugas b
import { hybridStorageService, HybridStorageData } from './hybridStorageService';
import { storageService } from './storageService';
import { STORAGE_KEYS } from './storageKeys';
import { authKeychain } from '../security/authKeychain';

export interface AppInitializationResult {
  // ✅ Data dari Hybrid Storage
  hybridData: HybridStorageData;
  
  // ✅ Status inisialisasi
  isAuthenticated: boolean;
  hasThemePreference: boolean;
  hasCartItems: boolean;
  
  // ✅ Error handling
  keychainError: boolean;
  storageError: boolean;
  
  // ✅ Performance metrics
  loadTime: number;
}

export class AppInitService {
  private loadStartTime: number = 0;

  async initializeApp(): Promise<AppInitializationResult> {
    this.loadStartTime = Date.now();
    
    try {
      console.log('🚀 Starting app initialization with Hybrid Storage...');

      // ✅ Tugas b: Load semua data secara paralel menggunakan hybrid storage
      const hybridData = await hybridStorageService.loadInitialData();

      const loadTime = Date.now() - this.loadStartTime;

      // ✅ Analisis hasil loading
      const isAuthenticated = !!hybridData.authToken;
      const hasThemePreference = !!hybridData.theme;
      const hasCartItems = !!(hybridData.cartItems && hybridData.cartItems.length > 0);

      console.log('📊 App Initialization Results:', {
        isAuthenticated,
        hasThemePreference,
        hasCartItems,
        loadTime: `${loadTime}ms`,
        keychainAccess: 'success'
      });

      return {
        hybridData,
        isAuthenticated,
        hasThemePreference,
        hasCartItems,
        keychainError: false,
        storageError: false,
        loadTime
      };

    } catch (error: any) {
      const loadTime = Date.now() - this.loadStartTime;
      
      // ✅ Tugas c: Handle keychain access denied secara spesifik
      if (error.message === 'KEYCHAIN_ACCESS_DENIED') {
        console.error('🔐 Keychain access denied during app initialization');
        
        return {
          hybridData: await this.getFallbackData(),
          isAuthenticated: false,
          hasThemePreference: false,
          hasCartItems: false,
          keychainError: true,
          storageError: false,
          loadTime
        };
      }

      // ✅ Handle storage errors umum
      console.error('❌ App initialization error:', error);
      
      return {
        hybridData: await this.getFallbackData(),
        isAuthenticated: false,
        hasThemePreference: false,
        hasCartItems: false,
        keychainError: false,
        storageError: true,
        loadTime
      };
    }
  }

  /**
   * ✅ Fallback data ketika terjadi error
   */
  private async getFallbackData(): Promise<HybridStorageData> {
    try {
      // Coba load hanya dari AsyncStorage sebagai fallback
      const [theme, notifications, cartItems] = await Promise.all([
        storageService.getItem<string>(STORAGE_KEYS.THEME_PREFERENCE),
        storageService.getItem<boolean>(STORAGE_KEYS.NOTIFICATION_STATUS),
        storageService.getItem<any[]>(STORAGE_KEYS.CART_ITEMS)
      ]);

      return {
        authToken: null,
        userId: null,
        theme,
        notifications,
        cartItems
      };
    } catch (error) {
      console.error('❌ Fallback data loading failed:', error);
      return {
        authToken: null,
        userId: null,
        theme: null,
        notifications: null,
        cartItems: null
      };
    }
  }

  /**
   * ✅ Utility untuk pre-load data yang diperlukan sebelum navigasi
   */
  async preloadCriticalData(): Promise<{
    authReady: boolean;
    preferencesReady: boolean;
  }> {
    try {
      const [hasAuthToken, hasPreferences] = await Promise.all([
        authKeychain.hasAuthToken(),
        this.hasUserPreferences()
      ]);

      return {
        authReady: hasAuthToken,
        preferencesReady: hasPreferences
      };
    } catch (error) {
      console.error('❌ Critical data preload failed:', error);
      return {
        authReady: false,
        preferencesReady: false
      };
    }
  }

  /**
   * ✅ Check jika user preferences ada
   */
  private async hasUserPreferences(): Promise<boolean> {
    try {
      const [theme, notifications] = await Promise.all([
        storageService.getItem(STORAGE_KEYS.THEME_PREFERENCE),
        storageService.getItem(STORAGE_KEYS.NOTIFICATION_STATUS)
      ]);

      return !!(theme || notifications);
    } catch (error) {
      return false;
    }
  }

  /**
   * ✅ Performance monitoring untuk hybrid storage
   */
  async measurePerformance(): Promise<{
    keychainLoadTime: number;
    asyncStorageLoadTime: number;
    totalLoadTime: number;
  }> {
    const startTime = Date.now();
    
    // Measure Keychain performance
    const keychainStart = Date.now();
    await authKeychain.getAuthToken();
    const keychainLoadTime = Date.now() - keychainStart;

    // Measure AsyncStorage performance  
    const asyncStorageStart = Date.now();
    await storageService.getItem(STORAGE_KEYS.THEME_PREFERENCE);
    const asyncStorageLoadTime = Date.now() - asyncStorageStart;

    const totalLoadTime = Date.now() - startTime;

    return {
      keychainLoadTime,
      asyncStorageLoadTime,
      totalLoadTime
    };
  }

  /**
   * ✅ Clear semua data (untuk debugging/development)
   */
  async clearAllData(): Promise<void> {
    try {
      console.log('🧹 Clearing all application data...');
      
      await Promise.all([
        // Clear Keychain data
        authKeychain.clearAuthToken(),
        
        // Clear AsyncStorage data
        storageService.multiRemove([
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.THEME_PREFERENCE,
          STORAGE_KEYS.NOTIFICATION_STATUS,
          STORAGE_KEYS.CART_ITEMS
        ])
      ]);

      console.log('✅ All application data cleared');
    } catch (error) {
      console.error('❌ Error clearing application data:', error);
      throw error;
    }
  }

  /**
   * ✅ Health check untuk storage systems
   */
  async healthCheck(): Promise<{
    keychainHealthy: boolean;
    asyncStorageHealthy: boolean;
    overallHealthy: boolean;
  }> {
    try {
      const [keychainHealthy, asyncStorageHealthy] = await Promise.all([
        this.checkKeychainHealth(),
        this.checkAsyncStorageHealth()
      ]);

      return {
        keychainHealthy,
        asyncStorageHealthy,
        overallHealthy: keychainHealthy && asyncStorageHealthy
      };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        keychainHealthy: false,
        asyncStorageHealthy: false,
        overallHealthy: false
      };
    }
  }

  private async checkKeychainHealth(): Promise<boolean> {
    try {
      // Coba baca dan tulis test data
      const testService = 'com.ecom:healthcheck';
      const testData = { username: 'healthcheck', password: 'test' };
      
      const saveSuccess = await authKeychain.saveAuthToken(testData.password, testData.username);
      if (!saveSuccess) return false;

      const retrieved = await authKeychain.getAuthToken();
      
      // Cleanup
      await authKeychain.clearAuthToken();
      
      return retrieved.token === testData.password;
    } catch (error) {
      return false;
    }
  }

  private async checkAsyncStorageHealth(): Promise<boolean> {
    try {
      const testKey = '@healthcheck:test';
      const testValue = 'healthcheck_value';
      
      await storageService.setItem(testKey, testValue);
      const retrieved = await storageService.getItem<string>(testKey);
      
      // Cleanup
      await storageService.removeItem(testKey);
      
      return retrieved === testValue;
    } catch (error) {
      return false;
    }
  }
}

export const appInitService = new AppInitService();