// src/storage/types.ts - UPDATED VERSION
import { Product, CartItem, User } from '../types/types';

export interface CachedData<T> {
  value: T;
  timestamp: number;
}

export interface StorageService {
  setItem<T>(key: string, value: T): Promise<void>;
  getItem<T>(key: string): Promise<T | null>;
  removeItem(key: string): Promise<void>;
  multiGet(keys: string[]): Promise<[string, string | null][]>; 
  multiSet(keyValuePairs: [string, string][]): Promise<void>; // ✅ ADD THIS
  multiRemove(keys: string[]): Promise<void>;
  mergeItem<T>(key: string, value: Partial<T>): Promise<void>;
  getAllKeys?(): Promise<string[]>; 
  clear?(): Promise<void>; 
}

export interface AuthStorage {
  saveAuthData(token: string, user: User): Promise<void>;
  getAuthData(): Promise<{ token: string | null; user: User | null }>;
  clearAuthData(): Promise<void>;
}

export interface CartStorage {
  saveCartItems(items: CartItem[]): Promise<void>;
  getCartItems(): Promise<CartItem[]>;
  clearCart(): Promise<void>;
}

export interface ProductStorage {
  saveCategories(categories: string[]): Promise<void>;
  getCategories(): Promise<string[] | null>;
  clearCategories(): Promise<void>;
}