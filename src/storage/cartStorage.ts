// src/storage/cartStorage.ts
import { storageService } from './storageService';
import { STORAGE_KEYS } from './storageKeys';
import { CartStorage } from './types';
import { CartItem } from '../types/types';

class CartStorageImpl implements CartStorage {
  async saveCartItems(items: CartItem[]): Promise<void> {
    try {
      await storageService.setItem(STORAGE_KEYS.CART_ITEMS, items);
      console.log(`🛒 Saved ${items.length} cart items`);
    } catch (error: any) {
      if (error.message === 'STORAGE_QUOTA_EXCEEDED') {
        // ✅ Tugas d: Handle storage full - clear old cart data
        console.warn('🛒 Storage full, clearing cart data');
        await this.clearCart();
        throw new Error('CART_STORAGE_FULL');
      }
      throw error;
    }
  }

  async getCartItems(): Promise<CartItem[]> {
    try {
      const items = await storageService.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS);
      return items || [];
    } catch (error) {
      console.error('❌ Error getting cart items:', error);
      return [];
    }
  }

  async clearCart(): Promise<void> {
    try {
      await storageService.removeItem(STORAGE_KEYS.CART_ITEMS);
      console.log('🛒 Cart cleared');
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      throw error;
    }
  }

  // ✅ Tugas d: Merge item untuk perubahan kecil (optimized)
  async mergeCartItem(updatedItem: Partial<CartItem>): Promise<void> {
    try {
      const currentItems = await this.getCartItems();
      const updatedItems = currentItems.map(item => 
        item.product.id === updatedItem.product?.id 
          ? { ...item, ...updatedItem }
          : item
      );
      
      await this.saveCartItems(updatedItems);
      console.log('🔀 Cart item merged successfully');
    } catch (error: any) {
      if (error.message === 'STORAGE_QUOTA_EXCEEDED') {
        throw new Error('Unable to update cart - storage full');
      }
      throw error;
    }
  }
}

export const cartStorage = new CartStorageImpl();