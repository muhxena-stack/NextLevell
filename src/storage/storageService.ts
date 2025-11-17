// src/storage/storageService.ts - COMPLETE FIX
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './types';

class StorageServiceImpl implements StorageService {
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`💾 Saved to ${key}:`, value);
    } catch (error: any) {
      if (error?.message?.includes('QuotaExceededError') || error?.message?.includes('Database is full')) {
        console.error('❌ Storage quota exceeded:', error);
        throw new Error('STORAGE_QUOTA_EXCEEDED');
      }
      console.error(`❌ Error saving to ${key}:`, error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`❌ Error reading from ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Removed ${key}`);
    } catch (error) {
      console.error(`❌ Error removing ${key}:`, error);
      throw error;
    }
  }

  // ✅ FIX: Convert readonly array to mutable
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      const results = await AsyncStorage.multiGet(keys);
      
      // Convert readonly array to mutable
      return results.map(([key, value]) => [key, value]);
    } catch (error) {
      console.error('❌ Error in multiGet:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
      console.log(`🗑️ MultiRemove for ${keys.length} keys`);
    } catch (error) {
      console.error('❌ Error in multiRemove:', error);
      throw error;
    }
  }

  async mergeItem<T>(key: string, value: Partial<T>): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.mergeItem(key, jsonValue);
      console.log(`🔀 Merged to ${key}:`, value);
    } catch (error: any) {
      if (error?.message?.includes('QuotaExceededError') || error?.message?.includes('Database is full')) {
        console.error('❌ Storage quota exceeded during merge:', error);
        throw new Error('STORAGE_QUOTA_EXCEEDED');
      }
      console.error(`❌ Error merging to ${key}:`, error);
      throw error;
    }
  }

  // ✅ FIX: Convert readonly string[] to string[]
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      // Convert readonly array to mutable
      return [...keys];
    } catch (error) {
      console.error('❌ Error getting all keys:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('🧹 All storage cleared');
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
      throw error;
    }
  }
}

export const storageService = new StorageServiceImpl();