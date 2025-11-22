// src/services/imagePickerService.ts - COMPLETE FIXED VERSION
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { 
  launchCamera, 
  launchImageLibrary, 
  CameraOptions as LibraryCameraOptions, 
  ImageLibraryOptions as LibraryImageLibraryOptions,
  ImagePickerResponse,
  Asset,
  MediaType
} from 'react-native-image-picker';

// ✅ Simple interface yang compatible
export interface SimpleImageAsset {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  base64?: string;
  timestamp?: number;
}

export interface SimpleCameraPermissionResult {
  granted: boolean;
  canAskAgain?: boolean;
}

class ImagePickerService {
  // ✅ Convert library asset ke type kita dengan safe defaults
  private convertAsset = (asset: Asset): SimpleImageAsset => ({
    uri: asset.uri || '',
    fileName: asset.fileName || this.generateFileName(),
    type: asset.type || 'image/jpeg',
    fileSize: asset.fileSize || 0,
    width: asset.width || 0,
    height: asset.height || 0,
    base64: asset.base64,
    timestamp: Date.now()
  });

  // ✅ Handle response dengan type yang benar dan error handling
  private handleResponse = (
    response: ImagePickerResponse,
    resolve: (assets: SimpleImageAsset[]) => void,
    reject: (error: string) => void
  ) => {
    if (response.didCancel) {
      console.log('📸 User cancelled image selection');
      resolve([]);
      return;
    }

    if (response.errorCode) {
      const errorMessage = response.errorMessage || 'Unknown error occurred';
      console.error('❌ Image picker error:', response.errorCode, errorMessage);
      
      // ✅ Handle specific error codes
      switch (response.errorCode) {
        case 'camera_unavailable':
          reject('Kamera tidak tersedia di perangkat ini');
          break;
        case 'permission':
          reject('Izin kamera atau galeri ditolak');
          break;
        case 'others':
          reject('Aplikasi galeri tidak ditemukan');
          break;
        default:
          reject(errorMessage);
      }
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const convertedAssets = response.assets.map(this.convertAsset);
      console.log(`✅ Successfully converted ${convertedAssets.length} assets`);
      resolve(convertedAssets);
    } else {
      console.log('📸 No assets selected');
      resolve([]);
    }
  };

  // ✅ Generate unique filename
  private generateFileName = (prefix: string = 'image'): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.jpg`;
  };

  // ✅ TUGAS a: Seleksi Multi-Foto dengan Optimasi
  async pickMultipleImages(selectionLimit: number = 5): Promise<SimpleImageAsset[]> {
    try {
      console.log(`📸 Picking multiple images, limit: ${selectionLimit}`);

      const options: LibraryImageLibraryOptions = {
        mediaType: 'photo' as MediaType,
        selectionLimit,
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.8,
        includeBase64: false,
        includeExtra: true
      };

      return new Promise((resolve, reject) => {
        launchImageLibrary(options, (response) => {
          this.handleResponse(response, resolve, reject);
        });
      });
    } catch (error) {
      console.error('❌ Error picking multiple images:', error);
      throw new Error('Gagal memilih gambar dari galeri');
    }
  }

  // ✅ TUGAS b: Izin Penyimpanan untuk Backup Foto (Android)
  async requestStoragePermission(): Promise<SimpleCameraPermissionResult> {
    if (Platform.OS !== 'android') {
      console.log('📱 Not Android, storage permission granted by default');
      return { granted: true };
    }

    try {
      console.log('🔐 Requesting storage permission for Android');

      const permission = Platform.Version >= 33 
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

      const granted = await PermissionsAndroid.request(permission, {
        title: 'Izin Penyimpanan Foto',
        message: 'Aplikasi membutuhkan izin untuk menyimpan foto ke galeri sebagai backup keamanan.',
        buttonPositive: 'Izinkan',
        buttonNegative: 'Tolak',
        buttonNeutral: 'Nanti'
      });

      const result: SimpleCameraPermissionResult = {
        granted: granted === PermissionsAndroid.RESULTS.GRANTED,
        canAskAgain: granted === PermissionsAndroid.RESULTS.DENIED
      };

      console.log(`📱 Storage permission ${result.granted ? 'GRANTED' : 'DENIED'}`);
      return result;

    } catch (error) {
      console.error('❌ Error requesting storage permission:', error);
      return { granted: false };
    }
  }

  // ✅ TUGAS b: Launch Camera dengan save option
  async takePhoto(saveToPhotos: boolean = false): Promise<SimpleImageAsset[]> {
    try {
      console.log(`📷 Taking photo, saveToPhotos: ${saveToPhotos}`);

      let hasStoragePermission = true;

      if (saveToPhotos && Platform.OS === 'android') {
        const permissionResult = await this.requestStoragePermission();
        hasStoragePermission = permissionResult.granted;

        if (!hasStoragePermission) {
          Alert.alert(
            'Izin Ditolak',
            'Foto tidak akan disimpan ke galeri publik. Foto hanya akan tersimpan di aplikasi.',
            [{ text: 'Mengerti' }]
          );
        }
      }

      const options: LibraryCameraOptions = {
        mediaType: 'photo' as MediaType,
        quality: 0.7,
        saveToPhotos: hasStoragePermission && saveToPhotos,
        includeBase64: false,
        cameraType: 'back',
        presentationStyle: 'fullScreen'
      };

      return new Promise((resolve, reject) => {
        launchCamera(options, (response) => {
          this.handleResponse(response, resolve, reject);
        });
      });
    } catch (error) {
      console.error('❌ Error taking photo:', error);
      throw new Error('Gagal mengambil foto dengan kamera');
    }
  }

  // ✅ TUGAS c: Upload File dengan FormData - FIXED: Handle semua undefined
  prepareFormData(asset: SimpleImageAsset, fieldName: string = 'file'): FormData {
    console.log('📦 Preparing form data for upload');
    
    const formData = new FormData();
    
    // ✅ FIX: Gunakan safe values untuk semua property yang mungkin undefined
    const fileData = {
      uri: asset.uri || '', // ✅ Handle undefined uri
      type: asset.type || 'image/jpeg', // ✅ Handle undefined type
      name: asset.fileName || this.generateFileName(), // ✅ Handle undefined fileName
    };

    console.log('📄 File data:', {
      uri: fileData.uri ? `${fileData.uri.substring(0, 50)}...` : 'empty',
      type: fileData.type,
      name: fileData.name
    });

    formData.append(fieldName, fileData as any);
    return formData;
  }

  // ✅ TUGAS e: Take Photo dengan Base64 Preview
  async takePhotoWithPreview(): Promise<SimpleImageAsset[]> {
    try {
      console.log('📷 Taking photo with base64 preview');

      const options: LibraryCameraOptions = {
        mediaType: 'photo' as MediaType,
        quality: 0.7,
        maxWidth: 300,
        maxHeight: 300,
        includeBase64: true,
        cameraType: 'back'
      };

      return new Promise((resolve, reject) => {
        launchCamera(options, (response) => {
          this.handleResponse(response, resolve, reject);
        });
      });
    } catch (error) {
      console.error('❌ Error taking photo with preview:', error);
      throw new Error('Gagal mengambil foto dengan preview');
    }
  }

  // ✅ Pick Single Image
  async pickSingleImage(includeBase64: boolean = false): Promise<SimpleImageAsset | null> {
    try {
      console.log(`🖼️ Picking single image, includeBase64: ${includeBase64}`);

      const options: LibraryImageLibraryOptions = {
        mediaType: 'photo' as MediaType,
        selectionLimit: 1,
        quality: 0.8,
        includeBase64,
        includeExtra: true
      };

      return new Promise((resolve, reject) => {
        launchImageLibrary(options, (response) => {
          if (response.didCancel) {
            console.log('📸 User cancelled single image selection');
            resolve(null);
            return;
          }

          if (response.errorCode) {
            reject(response.errorMessage || 'Error memilih gambar dari galeri');
            return;
          }

          if (response.assets && response.assets.length > 0) {
            const asset = this.convertAsset(response.assets[0]);
            console.log('✅ Single image selected successfully');
            resolve(asset);
          } else {
            console.log('📸 No image selected');
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('❌ Error picking single image:', error);
      throw new Error('Gagal memilih gambar dari galeri');
    }
  }

  // ✅ TUGAS d: Handle Camera Error dengan fallback ke galeri
  async takePhotoWithErrorHandling(): Promise<SimpleImageAsset[]> {
    try {
      console.log('📷 Taking photo with error handling');

      const options: LibraryCameraOptions = {
        mediaType: 'photo' as MediaType,
        quality: 0.7,
        includeBase64: false,
        cameraType: 'back'
      };

      return new Promise((resolve, reject) => {
        launchCamera(options, (response) => {
          // ✅ TUGAS d: Handle kamera tidak tersedia
          if (response.errorCode === 'camera_unavailable') {
            console.log('❌ Camera unavailable, offering gallery fallback');
            
            Alert.alert(
              'Kamera Tidak Tersedia',
              'Kamera tidak bisa dibuka. Apakah Anda ingin memilih dari galeri?',
              [
                { 
                  text: 'Batal', 
                  style: 'cancel',
                  onPress: () => {
                    console.log('📸 User cancelled gallery fallback');
                    resolve([]);
                  }
                },
                { 
                  text: 'Buka Galeri', 
                  onPress: async () => {
                    try {
                      console.log('🖼️ User chose gallery fallback');
                      const galleryAssets = await this.pickMultipleImages(1);
                      resolve(galleryAssets);
                    } catch (error) {
                      console.error('❌ Gallery fallback failed:', error);
                      reject('Gagal membuka galeri');
                    }
                  }
                }
              ]
            );
            return;
          }
          
          this.handleResponse(response, resolve, reject);
        });
      });
    } catch (error) {
      console.error('❌ Error in takePhotoWithErrorHandling:', error);
      throw new Error('Gagal mengambil foto dengan penanganan error');
    }
  }

  // ✅ NEW: Check camera permission
  async checkCameraPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS handle permission melalui Info.plist
    }

    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      console.log(`📷 Camera permission ${granted ? 'GRANTED' : 'DENIED'}`);
      return granted;
    } catch (error) {
      console.error('❌ Error checking camera permission:', error);
      return false;
    }
  }

  // ✅ NEW: Request camera permission
  async requestCameraPermission(): Promise<SimpleCameraPermissionResult> {
    if (Platform.OS !== 'android') {
      return { granted: true };
    }

    try {
      console.log('🔐 Requesting camera permission');

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Izin Kamera',
          message: 'Aplikasi membutuhkan izin kamera untuk mengambil foto.',
          buttonPositive: 'Izinkan',
          buttonNegative: 'Tolak',
        }
      );

      const result: SimpleCameraPermissionResult = {
        granted: granted === PermissionsAndroid.RESULTS.GRANTED,
        canAskAgain: granted === PermissionsAndroid.RESULTS.DENIED
      };

      console.log(`📷 Camera permission ${result.granted ? 'GRANTED' : 'DENIED'}`);
      return result;

    } catch (error) {
      console.error('❌ Error requesting camera permission:', error);
      return { granted: false };
    }
  }

  // ✅ NEW: Validate image asset
  validateImageAsset(asset: SimpleImageAsset): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!asset.uri || asset.uri.trim() === '') {
      errors.push('URI gambar tidak valid');
    }

    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
      errors.push('Ukuran file terlalu besar (maksimal 10MB)');
    }

    if (asset.width && asset.height) {
      if (asset.width > 4096 || asset.height > 4096) {
        errors.push('Dimensi gambar terlalu besar (maksimal 4096x4096)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ✅ NEW: Get asset info for debugging
  getAssetInfo(asset: SimpleImageAsset) {
    return {
      uri: asset.uri ? `${asset.uri.substring(0, 30)}...` : 'empty',
      fileName: asset.fileName || 'unknown',
      type: asset.type || 'unknown',
      fileSize: asset.fileSize ? `${(asset.fileSize / 1024).toFixed(1)} KB` : 'unknown',
      dimensions: asset.width && asset.height ? `${asset.width}x${asset.height}` : 'unknown',
      hasBase64: !!asset.base64,
      base64Length: asset.base64 ? asset.base64.length : 0,
      isValid: this.validateImageAsset(asset).isValid
    };
  }

  // ✅ NEW: Create safe asset dengan defaults
  createSafeAsset(asset: Partial<SimpleImageAsset>): SimpleImageAsset {
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
}

export const imagePickerService = new ImagePickerService();