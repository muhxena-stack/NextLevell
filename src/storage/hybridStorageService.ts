// src/storage/hybridStorageService.ts
import { authKeychain } from '../security/authKeychain';
import { storageService } from './storageService';
import { STORAGE_KEYS } from './storageKeys';

export interface HybridStorageData {
  // ✅ Tugas b: Data dari Keychain (secure)
  authToken: string | null;
  userId: string | null;
  
  // ✅ Tugas b: Data dari AsyncStorage (non-sensitive)
  theme: string | null;
  notifications: boolean | null;
  cartItems: any[] | null;
}

export class HybridStorageService {
  async loadInitialData(): Promise<HybridStorageData> {
    try {
      // ✅ Tugas b: Parallel loading menggunakan Promise.all
      const [keychainData, asyncStorageData] = await Promise.all([
        this.loadKeychainData(),    // Secure data
        this.loadAsyncStorageData() // Non-sensitive data
      ]);

      console.log('🚀 Hybrid storage data loaded:', {
        hasAuth: !!keychainData.authToken,
        hasTheme: !!asyncStorageData.theme,
        hasCart: !!asyncStorageData.cartItems?.length
      });

      return {
        ...keychainData,
        ...asyncStorageData
      };
    } catch (error) {
      console.error('❌ Error loading hybrid storage data:', error);
      return this.getDefaultData();
    }
  }

  private async loadKeychainData(): Promise<Pick<HybridStorageData, 'authToken' | 'userId'>> {
    try {
      const authData = await authKeychain.getAuthToken();
      return {
        authToken: authData.token,
        userId: authData.userId
      };
    } catch (error: any) {
      // ✅ Tugas c: Handle access denied
      if (error.message === 'KEYCHAIN_ACCESS_DENIED') {
        throw error; // Propagate untuk handling di level higher
      }
      return { authToken: null, userId: null };
    }
  }

  private async loadAsyncStorageData(): Promise<Pick<HybridStorageData, 'theme' | 'notifications' | 'cartItems'>> {
    try {
      const [theme, notifications, cartItems] = await Promise.all([
        storageService.getItem<string>(STORAGE_KEYS.THEME_PREFERENCE),
        storageService.getItem<boolean>(STORAGE_KEYS.NOTIFICATION_STATUS),
        storageService.getItem<any[]>(STORAGE_KEYS.CART_ITEMS)
      ]);

      return {
        theme,
        notifications,
        cartItems
      };
    } catch (error) {
      console.error('❌ Error loading async storage data:', error);
      return { theme: null, notifications: null, cartItems: null };
    }
  }

  private getDefaultData(): HybridStorageData {
    return {
      authToken: null,
      userId: null,
      theme: null,
      notifications: null,
      cartItems: null
    };
  }
}

export const hybridStorageService = new HybridStorageService();