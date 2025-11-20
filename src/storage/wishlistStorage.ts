// src/storage/wishlistStorage.ts - FIXED VERSION
import { storageService } from './storageService';

export interface WishlistData {
  items: number[];
  count: number;
  updatedAt: number;
}

class WishlistStorage {
  async saveWishlist(items: number[]): Promise<void> {
    try {
      const wishlistData: WishlistData = {
        items,
        count: items.length,
        updatedAt: Date.now()
      };

      // ✅ FIX: Gunakan multiSet dengan string values
      await storageService.multiSet([
        ['@ecommerce:wishlist_items', JSON.stringify(items)],
        ['@ecommerce:wishlist_meta', JSON.stringify({
          count: items.length,
          updatedAt: Date.now()
        })]
      ]);

      console.log('💝 Wishlist saved:', items.length, 'items');
    } catch (error) {
      console.error('❌ Error saving wishlist:', error);
      throw error;
    }
  }

  async getWishlist(): Promise<WishlistData> {
    try {
      // ✅ FIX: multiGet returns array of [key, value] pairs
      const results = await storageService.multiGet([
        '@ecommerce:wishlist_items',
        '@ecommerce:wishlist_meta'
      ]);

      // Extract values from results
      const itemsJson = results.find(([key]) => key === '@ecommerce:wishlist_items')?.[1];
      const metaJson = results.find(([key]) => key === '@ecommerce:wishlist_meta')?.[1];

      const items = itemsJson ? JSON.parse(itemsJson) : [];
      const meta = metaJson ? JSON.parse(metaJson) : { count: 0, updatedAt: 0 };

      return {
        items,
        count: meta.count,
        updatedAt: meta.updatedAt
      };
    } catch (error) {
      console.error('❌ Error loading wishlist:', error);
      return { items: [], count: 0, updatedAt: 0 };
    }
  }

  async clearWishlist(): Promise<void> {
    try {
      await storageService.multiRemove([
        '@ecommerce:wishlist_items',
        '@ecommerce:wishlist_meta'
      ]);
      console.log('💝 Wishlist cleared');
    } catch (error) {
      console.error('❌ Error clearing wishlist:', error);
      throw error;
    }
  }

  async toggleWishlistItem(productId: number): Promise<number[]> {
    try {
      const { items } = await this.getWishlist();
      const updatedItems = items.includes(productId)
        ? items.filter(id => id !== productId) // Remove
        : [...items, productId]; // Add

      await this.saveWishlist(updatedItems);
      return updatedItems;
    } catch (error) {
      console.error('❌ Error toggling wishlist item:', error);
      throw error;
    }
  }

  async isInWishlist(productId: number): Promise<boolean> {
    try {
      const { items } = await this.getWishlist();
      return items.includes(productId);
    } catch (error) {
      console.error('❌ Error checking wishlist:', error);
      return false;
    }
  }

  async getWishlistCount(): Promise<number> {
    try {
      const { count } = await this.getWishlist();
      return count;
    } catch (error) {
      console.error('❌ Error getting wishlist count:', error);
      return 0;
    }
  }
}

export const wishlistStorage = new WishlistStorage();