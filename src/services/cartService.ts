// src/services/cartService.ts
import { apiClient } from '../api/apiClient';

export interface Cart {
  id: number;
  products: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
    total: number;
    discountPercentage: number;
    discountedPrice: number;
  }>;
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}

export const cartService = {
  // GET cart data untuk polling (Soal e)
  getCart: async (cartId: number = 1): Promise<Cart> => {
    try {
      const response = await apiClient.get(`/carts/${cartId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get cart error:', error);
      throw error;
    }
  },

  // Simulasi update cart
  updateCart: async (cartId: number, products: any[]): Promise<Cart> => {
    try {
      const response = await apiClient.put(`/carts/${cartId}`, {
        products,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Update cart error:', error);
      throw error;
    }
  }
};