// src/storage/authStorage.ts
import { storageService } from './storageService';
import { STORAGE_KEYS } from './storageKeys';
import { AuthStorage } from './types';
import { User } from '../types/types';

class AuthStorageImpl implements AuthStorage {
  async saveAuthData(token: string, user: User): Promise<void> {
    try {
      // ✅ Tugas a: Simpan token dan user data
      await Promise.all([
        storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
        storageService.setItem(STORAGE_KEYS.USER_DATA, user)
      ]);
      console.log('🔐 Auth data saved successfully');
    } catch (error) {
      console.error('❌ Error saving auth data:', error);
      throw error;
    }
  }

  async getAuthData(): Promise<{ token: string | null; user: User | null }> {
    try {
      // ✅ Tugas a: Ambil auth data untuk guard flow
      const [token, user] = await Promise.all([
        storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN),
        storageService.getItem<User>(STORAGE_KEYS.USER_DATA)
      ]);
      
      return { token, user };
    } catch (error) {
      console.error('❌ Error getting auth data:', error);
      return { token: null, user: null };
    }
  }

  async clearAuthData(): Promise<void> {
    try {
      // ✅ Tugas e: Hapus data sensitif dengan multiRemove
      await storageService.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA
      ]);
      console.log('🔓 Auth data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      throw error;
    }
  }
}

export const authStorage = new AuthStorageImpl();