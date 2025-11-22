// src/utils/imageUtils.ts - COMPLETELY FIXED VERSION
import { SimpleImageAsset } from '../types/types';

export const imageUtils = {
  // Validasi file size (max 10MB)
  isValidFileSize: (fileSize: number | undefined, maxSizeMB: number = 10): boolean => {
    if (!fileSize) return true; // Skip validation if size unknown
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return fileSize <= maxSizeBytes;
  },

  // Validasi image dimensions
  isValidDimensions: (
    width: number | undefined, 
    height: number | undefined, 
    maxDimension: number = 4096
  ): boolean => {
    if (!width || !height) return true; // Skip validation if dimensions unknown
    return width <= maxDimension && height <= maxDimension;
  },

  // Format file size untuk display
  formatFileSize: (bytes: number | undefined): string => {
    if (!bytes) return 'Unknown size';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  // Check if image is from camera or gallery based on URI
  isFromCamera: (uri: string): boolean => {
    if (!uri) return false;
    return uri.includes('cache') || uri.includes('Camera') || uri.includes('temp');
  },

  // Generate unique filename
  generateFileName: (prefix: string = 'image'): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.jpg`;
  },

  // Compress image options based on use case
  getCompressionOptions: (useCase: 'avatar' | 'product' | 'preview') => {
    switch (useCase) {
      case 'avatar':
        return { quality: 0.7, maxWidth: 300, maxHeight: 300 };
      case 'product':
        return { quality: 0.8, maxWidth: 1024, maxHeight: 1024 };
      case 'preview':
        return { quality: 0.6, maxWidth: 800, maxHeight: 800 };
      default:
        return { quality: 0.8, maxWidth: 1024, maxHeight: 1024 };
    }
  },

  // ✅ FIX: Validate image before upload - Handle semua undefined
  validateImageForUpload: (asset: SimpleImageAsset): { isValid: boolean; message?: string } => {
    // ✅ FIX: Check URI dengan safe access
    if (!asset.uri || asset.uri.trim() === '') {
      return { isValid: false, message: 'URI gambar tidak valid.' };
    }

    // ✅ FIX: Check file size dengan safe access
    if (asset.fileSize && !this.isValidFileSize(asset.fileSize)) {
      return { isValid: false, message: 'File terlalu besar. Maksimal 10MB.' };
    }

    // ✅ FIX: Check dimensions dengan safe access
    if (asset.width && asset.height && !this.isValidDimensions(asset.width, asset.height)) {
      return { isValid: false, message: 'Dimensi gambar terlalu besar.' };
    }

    // ✅ FIX: Check supported format
    if (!this.isSupportedFormat(asset)) {
      return { isValid: false, message: 'Format gambar tidak didukung.' };
    }

    return { isValid: true };
  },

  // Extract file extension dari URI atau fileName
  getFileExtension: (asset: SimpleImageAsset): string => {
    const source = asset.fileName || asset.uri;
    if (!source) return 'jpg';
    
    const match = source.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : 'jpg';
  },

  // Check if image is supported format
  isSupportedFormat: (asset: SimpleImageAsset): boolean => {
    const extension = this.getFileExtension(asset);
    const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return supportedFormats.includes(extension);
  },

  // Get image orientation - ✅ FIX: Handle undefined
  getOrientation: (asset: SimpleImageAsset): 'portrait' | 'landscape' | 'square' => {
    if (!asset.width || !asset.height) return 'square';
    
    if (asset.width > asset.height) return 'landscape';
    if (asset.height > asset.width) return 'portrait';
    return 'square';
  },

  // Calculate aspect ratio - ✅ FIX: Handle undefined
  getAspectRatio: (asset: SimpleImageAsset): number => {
    if (!asset.width || !asset.height || asset.height === 0) return 1;
    return asset.width / asset.height;
  },

  // Check if image needs compression - ✅ FIX: Handle undefined
  needsCompression: (asset: SimpleImageAsset, maxSizeMB: number = 2): boolean => {
    if (!asset.fileSize) return false;
    return asset.fileSize > maxSizeMB * 1024 * 1024;
  },

  // Generate thumbnail options
  getThumbnailOptions: (useCase: 'avatar' | 'product' | 'list') => {
    switch (useCase) {
      case 'avatar':
        return { width: 100, height: 100, quality: 0.7 };
      case 'product':
        return { width: 300, height: 300, quality: 0.8 };
      case 'list':
        return { width: 200, height: 200, quality: 0.6 };
      default:
        return { width: 200, height: 200, quality: 0.7 };
    }
  },

  // Safe URI access dengan fallback - ✅ FIX: Handle undefined
  getSafeUri: (asset: SimpleImageAsset): string => {
    return asset.uri || 'https://via.placeholder.com/300x300?text=No+Image';
  },

  // Check if base64 data is valid
  isValidBase64: (base64: string | undefined): boolean => {
    if (!base64) return false;
    try {
      // Basic base64 validation
      return base64.length > 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(base64);
    } catch {
      return false;
    }
  },

  // Estimate base64 size
  estimateBase64Size: (base64: string | undefined): number => {
    if (!base64) return 0;
    // Base64 size estimation: (n * 3) / 4 - padding
    return Math.floor((base64.length * 3) / 4);
  },

  // ✅ NEW: Get image info summary
  getImageInfo: (asset: SimpleImageAsset) => {
    return {
      size: this.formatFileSize(asset.fileSize),
      dimensions: asset.width && asset.height ? `${asset.width}x${asset.height}` : 'Unknown',
      orientation: this.getOrientation(asset),
      format: this.getFileExtension(asset),
      needsCompression: this.needsCompression(asset),
      fromCamera: this.isFromCamera(asset.uri || ''),
      isValid: this.validateImageForUpload(asset).isValid
    };
  },

  // ✅ NEW: Safe property accessors
  getSafeFileName: (asset: SimpleImageAsset): string => {
    return asset.fileName || this.generateFileName();
  },

  getSafeFileType: (asset: SimpleImageAsset): string => {
    return asset.type || 'image/jpeg';
  },

  // ✅ NEW: Check if asset has required properties
  hasRequiredProperties: (asset: SimpleImageAsset): boolean => {
    return !!(asset.uri && asset.uri.trim() !== '');
  },

  // ✅ NEW: Create a safe asset object dengan defaults
  createSafeAsset: (asset: Partial<SimpleImageAsset>): SimpleImageAsset => {
    return {
      uri: asset.uri || '',
      fileName: asset.fileName || this.generateFileName(),
      type: asset.type || 'image/jpeg',
      fileSize: asset.fileSize || 0,
      width: asset.width || 0,
      height: asset.height || 0,
      base64: asset.base64,
      timestamp: asset.timestamp || Date.now()
    };
  }
};