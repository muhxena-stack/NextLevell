// src/services/productService.ts
import { apiClient } from '../api/apiClient';
import { Product, ApiProduct } from '../types/types';

export const productService = {
  // GET all products dengan Fetch API + AbortController (Soal a) - FIXED: Return ApiProduct[]
  getProductsWithFetch: async (signal?: AbortSignal): Promise<ApiProduct[]> => {
    try {
      const response = await fetch('https://dummyjson.com/products', {
        signal, // AbortController signal
        headers: {
          'Accept': 'application/json',
          'X-Client-Platform': 'React-Native'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 API Response:', data.products?.[0]); // Debug first product
      return data.products || []; // ✅ Return ApiProduct[] langsung dari API
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🛑 Fetch request was aborted');
        throw new Error('Request cancelled');
      }
      console.error('❌ Fetch products error:', error);
      throw error;
    }
  },

  // GET all products dengan Axios (alternative) - FIXED: Return ApiProduct[]
  getProductsWithAxios: async (): Promise<ApiProduct[]> => {
    try {
      const response = await apiClient.get('/products');
      console.log('📦 Axios Response:', response.data.products?.[0]); // Debug
      return response.data.products || []; // ✅ Return ApiProduct[]
    } catch (error) {
      console.error('❌ Axios products error:', error);
      throw error;
    }
  },

  // GET single product - FIXED: Return ApiProduct
  getProduct: async (id: number): Promise<ApiProduct> => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data; // ✅ Return ApiProduct
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // GET products by category - FIXED: Return ApiProduct[]
  getProductsByCategory: async (category: string): Promise<ApiProduct[]> => {
    try {
      const response = await apiClient.get(`/products/category/${category}`);
      return response.data.products || [];
    } catch (error) {
      console.error(`❌ Error fetching products by category ${category}:`, error);
      throw error;
    }
  },

  // Search products - FIXED: Return ApiProduct[]
  searchProducts: async (query: string): Promise<ApiProduct[]> => {
    try {
      const response = await apiClient.get(`/products/search?q=${query}`);
      return response.data.products || [];
    } catch (error) {
      console.error(`❌ Error searching products with query ${query}:`, error);
      throw error;
    }
  }
};