// src/storage/imageStorage.ts - FIXED VERSION
import { storageService } from './storageService';
import { STORAGE_KEYS } from './storageKeys';
import { SimpleImageAsset, ProductImageAssets } from '../types/types';

class ImageStorageService {
  private readonly PRODUCT_ASSETS_KEY = '@ecom:newProductAssets';
  private readonly AVATAR_BASE64_KEY = '@ecom:avatarBase64';

  // ✅ FIX: Gunakan SimpleImageAsset bukan ImagePickerAsset
  async saveProductAssets(assets: SimpleImageAsset[]): Promise<void> {
    try {
      const productAssets: ProductImageAssets[] = assets.map(asset => ({
        id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uri: asset.uri || '', // ✅ Handle undefined uri
        fileName: asset.fileName || `image_${Date.now()}.jpg`, // ✅ Handle undefined fileName
        base64: asset.base64, // ✅ base64 bisa undefined
        timestamp: Date.now(),
        fileSize: asset.fileSize || 0, // ✅ Handle undefined fileSize
        width: asset.width || 0, // ✅ Handle undefined width
        height: asset.height || 0 // ✅ Handle undefined height
      }));

      await storageService.setItem(this.PRODUCT_ASSETS_KEY, productAssets);
      console.log(`💾 Saved ${productAssets.length} product assets to storage`);
    } catch (error) {
      console.error('❌ Error saving product assets:', error);
      throw error;
    }
  }

  // ✅ FIX: Return ProductImageAssets[]
  async getProductAssets(): Promise<ProductImageAssets[]> {
    try {
      const assets = await storageService.getItem<ProductImageAssets[]>(this.PRODUCT_ASSETS_KEY);
      return assets || [];
    } catch (error) {
      console.error('❌ Error getting product assets:', error);
      return [];
    }
  }

  // ✅ FIX: Clear product assets
  async clearProductAssets(): Promise<void> {
    try {
      await storageService.removeItem(this.PRODUCT_ASSETS_KEY);
      console.log('🗑️ Cleared product assets from storage');
    } catch (error) {
      console.error('❌ Error clearing product assets:', error);
      throw error;
    }
  }

  // ✅ FIX: Remove specific product asset
  async removeProductAsset(assetId: string): Promise<void> {
    try {
      const currentAssets = await this.getProductAssets();
      const updatedAssets = currentAssets.filter(asset => asset.id !== assetId);
      await storageService.setItem(this.PRODUCT_ASSETS_KEY, updatedAssets);
      console.log(`🗑️ Removed product asset: ${assetId}`);
    } catch (error) {
      console.error('❌ Error removing product asset:', error);
      throw error;
    }
  }

  // ✅ FIX: Save avatar base64
  async saveAvatarBase64(base64String: string): Promise<void> {
    try {
      const avatarData = {
        base64: base64String,
        timestamp: Date.now(),
        lastUsed: Date.now()
      };

      await storageService.setItem(this.AVATAR_BASE64_KEY, avatarData);
      console.log('💾 Saved avatar base64 for quick preview');
    } catch (error) {
      console.error('❌ Error saving avatar base64:', error);
      throw error;
    }
  }

  // ✅ FIX: Get avatar base64
  async getAvatarBase64(): Promise<string | null> {
    try {
      const avatarData = await storageService.getItem<{ 
        base64: string; 
        timestamp: number;
        lastUsed?: number;
      }>(this.AVATAR_BASE64_KEY);
      
      if (!avatarData) {
        console.log('👤 No avatar base64 found in storage');
        return null;
      }

      // Update last used timestamp
      avatarData.lastUsed = Date.now();
      await storageService.setItem(this.AVATAR_BASE64_KEY, avatarData);

      console.log('👤 Avatar base64 loaded from storage');
      return avatarData.base64;
    } catch (error) {
      console.error('❌ Error getting avatar base64:', error);
      return null;
    }
  }

  // ✅ FIX: Clear avatar base64
  async clearAvatarBase64(): Promise<void> {
    try {
      await storageService.removeItem(this.AVATAR_BASE64_KEY);
      console.log('🗑️ Cleared avatar base64 from storage');
    } catch (error) {
      console.error('❌ Error clearing avatar base64:', error);
      throw error;
    }
  }

  // ✅ FIX: Update avatar last used
  async updateAvatarLastUsed(): Promise<void> {
    try {
      const avatarData = await storageService.getItem<{ 
        base64: string; 
        timestamp: number;
        lastUsed?: number;
      }>(this.AVATAR_BASE64_KEY);
      
      if (avatarData) {
        avatarData.lastUsed = Date.now();
        await storageService.setItem(this.AVATAR_BASE64_KEY, avatarData);
        console.log('👤 Updated avatar last used timestamp');
      }
    } catch (error) {
      console.error('❌ Error updating avatar last used:', error);
    }
  }

  // ✅ FIX: Clear all image data
  async clearAllImageData(): Promise<void> {
    try {
      await Promise.all([
        this.clearProductAssets(),
        this.clearAvatarBase64()
      ]);
      console.log('🧹 Cleared all image data from storage');
    } catch (error) {
      console.error('❌ Error clearing all image data:', error);
      throw error;
    }
  }

  // ✅ NEW: Get storage statistics
  async getStorageStats(): Promise<{
    productAssetsCount: number;
    avatarExists: boolean;
    totalItems: number;
  }> {
    try {
      const [productAssets, avatarData] = await Promise.all([
        this.getProductAssets(),
        storageService.getItem(this.AVATAR_BASE64_KEY)
      ]);

      return {
        productAssetsCount: productAssets.length,
        avatarExists: !!avatarData,
        totalItems: productAssets.length + (avatarData ? 1 : 0)
      };
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return {
        productAssetsCount: 0,
        avatarExists: false,
        totalItems: 0
      };
    }
  }

  // ✅ NEW: Check if storage has data
  async hasImageData(): Promise<boolean> {
    try {
      const [productAssets, avatarData] = await Promise.all([
        this.getProductAssets(),
        this.getAvatarBase64()
      ]);

      return productAssets.length > 0 || !!avatarData;
    } catch (error) {
      console.error('❌ Error checking image data:', error);
      return false;
    }
  }

  // ✅ NEW: Clean up old assets (older than 7 days)
  async cleanupOldAssets(maxAgeDays: number = 7): Promise<void> {
    try {
      const cutoffTime = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
      const assets = await this.getProductAssets();
      
      const recentAssets = assets.filter(asset => asset.timestamp > cutoffTime);
      
      if (recentAssets.length < assets.length) {
        await storageService.setItem(this.PRODUCT_ASSETS_KEY, recentAssets);
        console.log(`🧹 Cleaned up ${assets.length - recentAssets.length} old assets`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up old assets:', error);
    }
  }
}

export const imageStorage = new ImageStorageService();