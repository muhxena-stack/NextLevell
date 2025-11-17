// src/storage/productStorage.ts
import { storageService } from './storageService';
import { STORAGE_KEYS } from './storageKeys';
import { ProductStorage, CachedData } from './types';

// ✅ Tugas b: TTL 30 menit untuk kategori
const CATEGORIES_TTL = 30 * 60 * 1000; // 30 menit dalam milliseconds

class ProductStorageImpl implements ProductStorage {
  async saveCategories(categories: string[]): Promise<void> {
    try {
      const cachedData: CachedData<string[]> = {
        value: categories,
        timestamp: Date.now()
      };
      
      await storageService.setItem(STORAGE_KEYS.CATEGORIES, cachedData);
      console.log(`📁 Saved ${categories.length} categories with TTL`);
    } catch (error) {
      console.error('❌ Error saving categories:', error);
      throw error;
    }
  }

  async getCategories(): Promise<string[] | null> {
    try {
      const cachedData = await storageService.getItem<CachedData<string[]>>(STORAGE_KEYS.CATEGORIES);
      
      if (!cachedData) {
        console.log('📁 No cached categories found');
        return null;
      }

      // ✅ Tugas b: Check TTL expiration
      const isExpired = Date.now() - cachedData.timestamp > CATEGORIES_TTL;
      
      if (isExpired) {
        console.log('📁 Categories cache expired');
        await this.clearCategories(); // Hapus data expired
        return null;
      }

      console.log('📁 Using cached categories');
      return cachedData.value;
    } catch (error) {
      console.error('❌ Error getting categories:', error);
      return null;
    }
  }

  async clearCategories(): Promise<void> {
    try {
      await storageService.multiRemove([
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.CATEGORIES_TIMESTAMP
      ]);
      console.log('📁 Categories cache cleared');
    } catch (error) {
      console.error('❌ Error clearing categories:', error);
      throw error;
    }
  }

  // ✅ Cache-First strategy untuk kategori
  async getCategoriesWithCacheFirst(fetchFromAPI: () => Promise<string[]>): Promise<string[]> {
    try {
      // Cek cache dulu
      const cachedCategories = await this.getCategories();
      
      if (cachedCategories) {
        console.log('📁 Returning cached categories');
        return cachedCategories;
      }

      // Jika cache tidak ada atau expired, fetch dari API
      console.log('📁 Fetching categories from API');
      const freshCategories = await fetchFromAPI();
      
      // Simpan ke cache
      await this.saveCategories(freshCategories);
      
      return freshCategories;
    } catch (error) {
      console.error('❌ Error in cache-first strategy:', error);
      throw error;
    }
  }
}

export const productStorage = new ProductStorageImpl();