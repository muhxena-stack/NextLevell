// MODIFIKASI: src/storage/authStorage.ts
import { storageService } from './storageService';
import { STORAGE_KEYS } from './storageKeys';
import { AuthStorage } from './types';
import { User } from '../types/types';

class AuthStorageImpl implements AuthStorage {
  async saveAuthData(token: string, user: User, expiresInMinutes: number = 60): Promise<void> {
    try {
      const expiryTime = Date.now() + (expiresInMinutes * 60 * 1000);
      
      await Promise.all([
        storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
        storageService.setItem(STORAGE_KEYS.USER_DATA, user),
        storageService.setItem('@ecommerce:token_expiry', expiryTime)
      ]);
      
      console.log('🔐 Auth data with expiry saved successfully');
    } catch (error) {
      console.error('❌ Error saving auth data:', error);
      throw error;
    }
  }

  async getAuthData(): Promise<{ token: string | null; user: User | null }> {
    try {
      const [token, user, expiryTime] = await Promise.all([
        storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN),
        storageService.getItem<User>(STORAGE_KEYS.USER_DATA),
        storageService.getItem<number>('@ecommerce:token_expiry')
      ]);
      
      // ✅ Tugas a: Check token expiry
      if (token && expiryTime && Date.now() > expiryTime) {
        console.log('🕒 Token expired, clearing auth data');
        await this.clearAuthData();
        return { token: null, user: null };
      }
      
      return { token, user };
    } catch (error) {
      console.error('❌ Error getting auth data:', error);
      return { token: null, user: null };
    }
  }

  async clearAuthData(): Promise<void> {
    try {
      await storageService.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        '@ecommerce:token_expiry'
      ]);
      console.log('🔓 Auth data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      throw error;
    }
  }

  // ✅ Utility untuk check token expiry
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiryTime = await storageService.getItem<number>('@ecommerce:token_expiry');
      if (!expiryTime) return true;
      
      const isExpired = Date.now() > expiryTime;
      if (isExpired) {
        await this.clearAuthData();
      }
      
      return isExpired;
    } catch (error) {
      console.error('❌ Error checking token expiry:', error);
      return true;
    }
  }
}

export const authStorage = new AuthStorageImpl();