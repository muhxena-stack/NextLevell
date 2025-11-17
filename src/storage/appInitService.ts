// src/storage/appInitService.ts - FIXED
import { storageService } from './storageService';
import { STORAGE_KEYS } from './storageKeys';

export interface AppInitData {
  authToken: string | null;
  userData: any | null;
  theme: string | null;
  notifications: boolean | null;
  cartItems: any[] | null;
}

export class AppInitService {
  async loadInitialData(): Promise<AppInitData> {
    try {
      // ✅ FIX: Convert readonly array to mutable array
      const keys = [...STORAGE_KEYS.APP_INIT_KEYS];
      
      // ✅ Tugas c: MultiGet untuk load data penting sekaligus
      const results = await storageService.multiGet(keys);
      
      const data: AppInitData = {
        authToken: null,
        userData: null,
        theme: null,
        notifications: null,
        cartItems: null
      };

      // Process results
      results.forEach(([key, value]) => {
        if (value) {
          try {
            const parsedValue = JSON.parse(value);
            
            switch (key) {
              case STORAGE_KEYS.AUTH_TOKEN:
                data.authToken = parsedValue;
                break;
              case STORAGE_KEYS.USER_DATA:
                data.userData = parsedValue;
                break;
              case STORAGE_KEYS.THEME_PREFERENCE:
                data.theme = parsedValue;
                break;
              case STORAGE_KEYS.NOTIFICATION_STATUS:
                data.notifications = parsedValue;
                break;
              case STORAGE_KEYS.CART_ITEMS:
                data.cartItems = parsedValue;
                break;
            }
          } catch (parseError) {
            console.error(`❌ Error parsing ${key}:`, parseError);
          }
        }
      });

      console.log('🚀 App initialization data loaded:', {
        hasAuth: !!data.authToken,
        hasUser: !!data.userData,
        hasTheme: !!data.theme,
        hasCartItems: !!data.cartItems?.length
      });

      return data;
    } catch (error) {
      console.error('❌ Error loading app initialization data:', error);
      // Return default values jika error
      return {
        authToken: null,
        userData: null,
        theme: null,
        notifications: null,
        cartItems: null
      };
    }
  }
}

export const appInitService = new AppInitService();