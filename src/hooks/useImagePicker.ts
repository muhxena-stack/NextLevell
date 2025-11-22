// src/hooks/useImagePicker.ts - COMPLETELY FIXED VERSION
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { imagePickerService } from '../services/imagePickerService';
import { imageStorage } from '../storage/imageStorage';
import { SimpleImageAsset, ProductImageAssets } from '../types/types';

export const useImagePicker = () => {
  const [selectedImages, setSelectedImages] = useState<SimpleImageAsset[]>([]);
  const [productAssets, setProductAssets] = useState<ProductImageAssets[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIX: Handle base64 yang mungkin undefined
  const pickProductImages = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const assets = await imagePickerService.pickMultipleImages(5);
      
      if (assets.length > 0) {
        setSelectedImages(assets);
        
        // Otomatis simpan ke storage
        await imageStorage.saveProductAssets(assets);
        
        // Load ulang dari storage untuk konsistensi
        const storedAssets = await imageStorage.getProductAssets();
        setProductAssets(storedAssets);

        console.log(`📸 Selected ${assets.length} images for product`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal memilih gambar';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, []);

  // ✅ FIX: Handle base64 yang mungkin undefined
  const pickAvatar = useCallback(async (): Promise<SimpleImageAsset | null> => {
    try {
      setError(null);
      const asset = await imagePickerService.pickSingleImage(true);
      
      // ✅ FIX: Check jika base64 ada sebelum menyimpan
      if (asset && asset.base64) {
        await imageStorage.saveAvatarBase64(asset.base64);
        console.log('👤 Avatar picked with base64 preview');
      } else if (asset) {
        console.log('👤 Avatar picked without base64');
      }
      
      return asset;
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal memilih avatar';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    }
  }, []);

  // ✅ FIX: Handle base64 yang mungkin undefined
  const takeAvatarPhoto = useCallback(async (): Promise<SimpleImageAsset | null> => {
    try {
      setError(null);
      const assets = await imagePickerService.takePhotoWithPreview();
      
      // ✅ FIX: Check jika base64 ada sebelum menyimpan
      if (assets.length > 0) {
        const asset = assets[0];
        
        if (asset.base64) {
          await imageStorage.saveAvatarBase64(asset.base64);
          console.log('📸 Avatar photo taken with base64 preview');
        } else {
          console.log('📸 Avatar photo taken without base64');
        }
        
        return asset;
      }
      
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal mengambil foto';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    }
  }, []);

  // ✅ FIX: Handle semua property yang mungkin undefined
  const uploadImage = useCallback(async (
    asset: SimpleImageAsset, 
    uploadUrl: string
  ): Promise<boolean> => {
    try {
      setUploading(true);
      setError(null);

      // ✅ FIX: Gunakan safe values untuk semua property
      const formData = imagePickerService.prepareFormData(asset);

      console.log('📤 Uploading image to:', uploadUrl);
      
      // Contoh fetch request
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      console.log('✅ Image uploaded successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal mengupload gambar';
      setError(errorMessage);
      Alert.alert('Upload Error', errorMessage);
      return false;
    } finally {
      setUploading(false);
    }
  }, []);

  // Clear product images
  const clearProductImages = useCallback(async (): Promise<void> => {
    try {
      setSelectedImages([]);
      setProductAssets([]);
      await imageStorage.clearProductAssets();
      console.log('🗑️ Cleared all product images');
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus gambar');
    }
  }, []);

  // Save product images to storage
  const saveProductImagesToStorage = useCallback(async (assets: SimpleImageAsset[]): Promise<void> => {
    try {
      await imageStorage.saveProductAssets(assets);
      const storedAssets = await imageStorage.getProductAssets();
      setProductAssets(storedAssets);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan gambar');
    }
  }, []);

  // ✅ NEW: Safe method untuk handle image selection dengan validation
  const handleImageSelection = useCallback(async (asset: SimpleImageAsset | null): Promise<void> => {
    if (!asset) return;
    
    try {
      // Validasi asset sebelum diproses
      if (!asset.uri) {
        throw new Error('Gambar tidak valid: URI tidak tersedia');
      }

      // Process the asset
      console.log('🖼️ Processing selected image:', {
        uri: asset.uri,
        fileName: asset.fileName || 'unknown',
        size: asset.fileSize ? `${(asset.fileSize / 1024).toFixed(1)} KB` : 'unknown',
        hasBase64: !!asset.base64
      });

      // Simpan ke state jika needed
      setSelectedImages(prev => [...prev, asset]);

    } catch (err: any) {
      const errorMessage = err.message || 'Gagal memproses gambar';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, []);

  // ✅ NEW: Utility untuk check jika asset valid
  const isValidAsset = useCallback((asset: SimpleImageAsset): boolean => {
    return !!(asset.uri && asset.uri.trim() !== '');
  }, []);

  // ✅ NEW: Get asset info untuk debugging
  const getAssetInfo = useCallback((asset: SimpleImageAsset) => {
    return {
      uri: asset.uri || 'No URI',
      fileName: asset.fileName || 'No filename',
      type: asset.type || 'Unknown type',
      fileSize: asset.fileSize ? `${(asset.fileSize / 1024).toFixed(1)} KB` : 'Unknown size',
      dimensions: asset.width && asset.height ? `${asset.width}x${asset.height}` : 'Unknown dimensions',
      hasBase64: !!asset.base64,
      base64Length: asset.base64 ? asset.base64.length : 0
    };
  }, []);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Additional utility methods
  const takePhotoWithSaveOption = useCallback(async (saveToPhotos: boolean = false): Promise<SimpleImageAsset[]> => {
    try {
      setError(null);
      const assets = await imagePickerService.takePhoto(saveToPhotos);
      return assets;
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal mengambil foto';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return [];
    }
  }, []);

  const takePhotoWithErrorHandling = useCallback(async (): Promise<SimpleImageAsset[]> => {
    try {
      setError(null);
      const assets = await imagePickerService.takePhotoWithErrorHandling();
      return assets;
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal mengambil foto';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return [];
    }
  }, []);

  const requestStoragePermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await imagePickerService.requestStoragePermission();
      return result.granted;
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal meminta izin penyimpanan';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Load existing product assets on mount
  useState(() => {
    const loadExistingAssets = async () => {
      try {
        const assets = await imageStorage.getProductAssets();
        setProductAssets(assets);
      } catch (err) {
        console.error('Error loading existing assets:', err);
      }
    };

    loadExistingAssets();
  });

  return {
    // State
    selectedImages,
    productAssets,
    uploading,
    error,

    // Methods - Product Images
    pickProductImages,
    clearProductImages,
    saveProductImagesToStorage,

    // Methods - Avatar/Profile
    pickAvatar,
    takeAvatarPhoto,

    // Methods - Camera & Permissions
    takePhotoWithSaveOption,
    takePhotoWithErrorHandling,
    requestStoragePermission,

    // Methods - Upload & Processing
    uploadImage,
    handleImageSelection,
    clearError,

    // ✅ NEW: Utility methods untuk safe operations
    isValidAsset,
    getAssetInfo,

    // Computed properties
    hasSelectedImages: selectedImages.length > 0,
    hasProductAssets: productAssets.length > 0,
    selectedImagesCount: selectedImages.length,
    productAssetsCount: productAssets.length,
    
    // ✅ NEW: Safe access to first image
    firstSelectedImage: selectedImages[0] || null,
    firstProductAsset: productAssets[0] || null,
  };
};