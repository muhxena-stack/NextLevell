// src/storage/productCache.ts
import { storageService } from './storageService';
import { Product } from '../types/types';

interface CachedProduct {
  value: Product;
  ttl: number;
  cachedAt: number;
}

class ProductCache {
  private getCacheKey(productId: number): string {
    return `@product_detail:${productId}`;
  }

  async cacheProduct(product: Product, ttlMinutes: number = 60): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(product.id);
      const cachedData: CachedProduct = {
        value: product,
        ttl: ttlMinutes * 60 * 1000, // Convert to milliseconds
        cachedAt: Date.now()
      };

      await storageService.setItem(cacheKey, cachedData);
      console.log(`💾 Product ${product.id} cached for ${ttlMinutes} minutes`);
    } catch (error) {
      console.error('❌ Error caching product:', error);
    }
  }

  async getCachedProduct(productId: number): Promise<Product | null> {
    try {
      const cacheKey = this.getCacheKey(productId);
      const cachedData = await storageService.getItem<CachedProduct>(cacheKey);
      
      if (!cachedData) return null;

      const isExpired = Date.now() > cachedData.cachedAt + cachedData.ttl;
      
      if (isExpired) {
        await storageService.removeItem(cacheKey);
        console.log(`🕒 Product ${productId} cache expired`);
        return null;
      }

      console.log(`💾 Product ${productId} loaded from cache`);
      return cachedData.value;
    } catch (error) {
      console.error('❌ Error getting cached product:', error);
      return null;
    }
  }

  async clearExpiredCache(): Promise<void> {
    try {
      const allKeys = await storageService.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('@product_detail:'));
      
      const cleanupPromises = cacheKeys.map(async (key) => {
        const cachedData = await storageService.getItem<CachedProduct>(key);
        if (cachedData && Date.now() > cachedData.cachedAt + cachedData.ttl) {
          await storageService.removeItem(key);
        }
      });

      await Promise.all(cleanupPromises);
      console.log('🧹 Expired product cache cleared');
    } catch (error) {
      console.error('❌ Error clearing expired cache:', error);
    }
  }
}

export const productCache = new ProductCache();