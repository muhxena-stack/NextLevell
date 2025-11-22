// src/types/types.ts - COMPLETE FIXED VERSION

// ==================== CORE PRODUCT TYPES ====================

// Interface untuk Produk Lokal
export interface Product {
  id: number;
  nama: string;
  harga: number;
  urlGambar?: string;
  deskripsi: string;
  kategori: string;
  rating?: number;
  terjual?: number;
  // 🆕 NEW: Support multiple images
  images?: string[];
  imageAssets?: ProductImageAssets[];
  thumbnail?: string;
  primaryImageIndex?: number;
}

// Interface untuk Produk dari API DummyJSON
export interface ApiProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

// 🆕 NEW: Extended product dengan images
export interface ProductWithImages extends Product {
  imageGallery: string[];
  primaryImage: string;
  imageCount: number;
  hasHighResImages: boolean;
}

// 🆕 NEW: Product Variant untuk images
export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

// ==================== CART TYPES ====================

// Interface untuk Item dalam Keranjang
export interface CartItem {
  product: Product;
  quantity: number;
  // 🆕 NEW: Product image reference
  productImage?: string;
  selectedVariant?: ProductVariant;
}

// Interface untuk Context Keranjang
export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void; 
  removeFromCart: (productId: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  // 🆕 NEW: Image methods
  getCartItemImage?: (productId: number) => string | undefined;
  updateCartItemImage?: (productId: number, imageUrl: string) => Promise<void>;
}

// ==================== NETWORKING TYPES ====================

// Interface untuk Login Request
export interface LoginCredentials {
  username: string;
  password: string;
}

// Interface untuk Login Response
export interface LoginResponse {
  success: boolean;
  token: string;
  user?: any;
}

// Interface untuk Cart dari API
export interface ApiCart {
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

// Interface untuk API Response DummyJSON
export interface ProductsResponse {
  products: ApiProduct[];
  total: number;
  skip: number;
  limit: number;
}

export interface SingleProductResponse {
  product: ApiProduct;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
}

// 🆕 NEW: Image Upload Responses
export interface AvatarUploadResponse {
  success: boolean;
  avatarUrl: string;
  thumbnailUrl?: string;
  message?: string;
}

export interface ProductImagesUploadResponse {
  success: boolean;
  imageUrls: string[];
  uploadedCount: number;
  failedCount: number;
  errors?: string[];
}

export interface ImageValidationResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// ==================== ERROR HANDLING TYPES ====================

// Unified Error Interface
export interface AppError {
  code: string;
  message: string;
  details?: any;
  status?: number;
  // 🆕 NEW: Image-specific error properties
  imageRelated?: boolean;
  recoverable?: boolean;
  suggestion?: string;
}

// Image-specific error types
export interface ImagePickerError {
  code: string;
  message: string;
  details?: any;
  recoverable?: boolean;
}

export type ImagePickerErrorCode = 
  | 'PERMISSION_DENIED'
  | 'CAMERA_UNAVAILABLE'
  | 'GALLERY_UNAVAILABLE'
  | 'STORAGE_FULL'
  | 'INVALID_IMAGE'
  | 'UPLOAD_FAILED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// ==================== COMPONENT PROP TYPES ====================

// Interface untuk Props ProductItem
export interface ProductItemProps {
  product: Product;
  onPress: (product: Product) => void; 
  itemWidth: string;
  // 🆕 NEW: Image loading options
  imageSize?: 'small' | 'medium' | 'large';
  showImageCount?: boolean;
  lazyLoad?: boolean;
}

// Interface untuk Props AddProductModal
export interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newProduct: Product) => void;
  // 🆕 NEW: Image support
  initialImages?: string[];
  onImagesChange?: (images: string[]) => void;
}

// Interface untuk Props ProductCatalogScreen
export interface ProductCatalogScreenProps {
  filter?: string;
}

// 🆕 NEW: Image Picker Component Props
export interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (asset: SimpleImageAsset) => void;
  title?: string;
  includeBase64?: boolean;
  showPreview?: boolean;
  cameraOnly?: boolean;
  galleryOnly?: boolean;
}

export interface ProductImagePickerProps {
  onImagesSelected?: (assets: ProductImageAssets[]) => void;
  maxSelection?: number;
  initialAssets?: ProductImageAssets[];
  showUploadProgress?: boolean;
  enableCompression?: boolean;
}

export interface ProfileHeaderProps {
  user: User;
  onEditPress: () => void;
  onAvatarPress: () => void;
  avatarLoading?: boolean;
  onAvatarLoad?: () => void;
  onAvatarError?: (error: string) => void;
}

export interface ImagePreviewProps {
  source: { uri: string } | { base64: string };
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: (error: any) => void;
}

// ==================== NAVIGATION TYPES ====================

// Type untuk Navigation Params
export type HomeStackParamList = {
  HomeTabs: undefined;
  ProductDetail: { product: Product };
  ProductList: undefined;
  Cart: undefined;
  Checkout: { product: Product };
  // 🆕 NEW: Image-related screens
  ImageGallery: { images: string[]; initialIndex?: number };
  Camera: { 
    onCapture: (image: SimpleImageAsset) => void;
    mode?: 'photo' | 'video';
    title?: string;
  };
};

export type DrawerParamList = {
  MainTabs: undefined;
  Profile: undefined;
  Settings: undefined;
  // 🆕 NEW: Image-related drawer items
  ChangeAvatar: { onAvatarChange: (avatarUrl: string) => void };
};

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  // 🆕 NEW: Image picker routes
  ImagePicker: { 
    selectionLimit?: number;
    onImagesSelected: (assets: SimpleImageAsset[]) => void;
    title?: string;
  };
};

// ==================== AUTHENTICATION TYPES ====================

// Interface untuk User (Authentication)
export interface User {
  id: string;
  nama: string;
  email: string;
  // 🆕 NEW: Avatar support
  avatar?: string;
  avatarBase64?: string;
  avatarThumbnail?: string;
  lastAvatarUpdate?: number;
}

// Interface untuk Auth Context
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  userID: string;
  // 🆕 NEW: Avatar methods
  updateUserAvatar?: (avatarUrl: string, base64?: string) => Promise<void>;
  removeUserAvatar?: () => Promise<void>;
  getAvatarPreview?: () => string | null;
}

// ==================== NETWORK STATUS TYPES ====================

// Interface untuk Network Status
export interface NetworkStatus {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  connectionType: string;
  isOnline: boolean;
}

// ==================== CATEGORY TYPES ====================

// Type untuk Kategori Produk yang Tersedia
export type ProductCategory = 
  | 'Populer'
  | 'Terbaru' 
  | 'Diskon'
  | 'Elektronik'
  | 'Otomotif'
  | 'Bayi'
  | 'Pakaian'
  | 'Makanan';

// ==================== FORM TYPES ====================

// Interface untuk Form Tambah Produk
export interface AddProductForm {
  nama: string;
  harga: string;
  deskripsi: string;
  urlGambar: string;
  kategori: string;
  // 🆕 NEW: Multiple images support
  images?: string[];
  imageAssets?: ProductImageAssets[];
  primaryImageIndex?: number;
}

// 🆕 NEW: Edit Profile Form dengan avatar
export interface EditProfileForm {
  nama: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  avatarBase64?: string;
  removeAvatar?: boolean;
}

// ==================== RESPONSIVE TYPES ====================

// Interface untuk Responsive Utilities
export interface GridConfig {
  columns: number;
  spacing: number;
  margin: number;
}

// Type untuk Breakpoints
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// ==================== FILTER & SORT TYPES ====================

// Interface untuk Filter State
export interface FilterState {
  searchQuery: string;
  selectedCategory: ProductCategory | 'all';
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: 'name' | 'price' | 'newest';
}

// ==================== API RESPONSE TYPES ====================

// Type untuk API Response
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
}

// Type untuk Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==================== SERVICE RESPONSE TYPES ====================

// Interface untuk Service Response
export interface ServiceResponse<T> {
  data: T | null;
  error: AppError | null;
  loading: boolean;
}

// ==================== ORDER & PAYMENT TYPES ====================

// Enum untuk Status Order
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Interface untuk Order
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalHarga: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Interface untuk Address
export interface Address {
  id: string;
  namaPenerima: string;
  telepon: string;
  jalan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  isDefault: boolean;
}

// ==================== IMAGE PICKER TYPES ====================

// 🆕 NEW: Simple Image Asset Type (Tidak conflict dengan library)
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

// 🆕 NEW: Permission Types
export interface CameraPermissionResult {
  granted: boolean;
  canAskAgain?: boolean;
  rationalNeeded?: boolean;
}

export interface GalleryPermissionResult {
  granted: boolean;
  canAskAgain?: boolean;
  rationalNeeded?: boolean;
}

export interface PermissionRequestConfig {
  title: string;
  message: string;
  buttonPositive: string;
  buttonNegative: string;
  buttonNeutral?: string;
}

// 🆕 NEW: Product Image Types
export interface ProductImageAssets {
  id: string;
  uri: string;
  fileName: string;
  base64?: string;
  timestamp: number;
  fileSize?: number;
  width?: number;
  height?: number;
}

export interface ProductImageState {
  assets: ProductImageAssets[];
  selectedIndex: number;
  uploading: boolean;
  error?: string;
}

// 🆕 NEW: Upload Types
export interface ImageUploadConfig {
  fieldName?: string;
  uploadUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  maxRetries?: number;
}

export interface ImageUploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
  statusCode?: number;
}

export interface BatchUploadResult {
  total: number;
  successful: number;
  failed: number;
  results: ImageUploadResult[];
}

// 🆕 NEW: Compression Types
export interface ImageCompressionOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  compressFormat?: 'JPEG' | 'PNG' | 'WEBP';
  rotation?: number;
}

export interface CompressionResult {
  uri: string;
  width: number;
  height: number;
  size: number;
  originalSize: number;
  compressionRatio: number;
}

// 🆕 NEW: Storage Types
export interface StoredAvatar {
  base64: string;
  timestamp: number;
  uri?: string;
  lastUsed: number;
}

export interface ImageCacheItem {
  key: string;
  uri: string;
  base64?: string;
  timestamp: number;
  size: number;
  lastAccessed: number;
}

export interface ImageStorageStats {
  totalItems: number;
  totalSize: number;
  avatarExists: boolean;
  productAssetsCount: number;
  cacheItemsCount: number;
}

// 🆕 NEW: Image Upload State
export interface ImageUploadState {
  uploading: boolean;
  progress: number;
  currentFile?: string;
  totalFiles: number;
  completedFiles: number;
  error?: string;
}

// ==================== SERVICE INTERFACE TYPES ====================

// 🆕 NEW: Image Service Interface
export interface ImageService {
  pickMultipleImages: (selectionLimit?: number) => Promise<SimpleImageAsset[]>;
  pickSingleImage: (includeBase64?: boolean) => Promise<SimpleImageAsset | null>;
  takePhotoWithSaveOption: (saveToPhotos?: boolean) => Promise<SimpleImageAsset[]>;
  takePhotoWithBase64Preview: () => Promise<SimpleImageAsset[]>;
  requestStoragePermission: () => Promise<CameraPermissionResult>;
  prepareFormData: (asset: SimpleImageAsset, fieldName?: string) => FormData;
}

// 🆕 NEW: Image Storage Interface
export interface ImageStorage {
  saveProductAssets: (assets: SimpleImageAsset[]) => Promise<void>;
  getProductAssets: () => Promise<ProductImageAssets[]>;
  clearProductAssets: () => Promise<void>;
  saveAvatarBase64: (base64String: string) => Promise<void>;
  getAvatarBase64: () => Promise<string | null>;
  clearAvatarBase64: () => Promise<void>;
  clearAllImageData: () => Promise<void>;
}

// ==================== SETTINGS TYPES ====================

// 🆕 NEW: Image Settings
export interface ImageSettings {
  compressionEnabled: boolean;
  compressionQuality: number;
  maxImageSize: number;
  autoSaveToGallery: boolean;
  cacheEnabled: boolean;
  cacheSize: number;
  prefetchImages: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  // 🆕 NEW: Image settings
  imageSettings: ImageSettings;
  autoUploadImages: boolean;
  imageQuality: 'low' | 'medium' | 'high';
}

// ==================== UTILITY TYPES ====================

// Simple utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type MakeRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };

// Type untuk Dimension Value (React Native)
export type DimensionValue = number | string | undefined;

// 🆕 NEW: Image-specific utility types
export type ImageResizeMode = 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
export type ImageSource = { uri: string } | { base64: string } | number;
export type ImagePriority = 'low' | 'normal' | 'high';

// ==================== POLLING TYPES ====================

// Interface untuk Polling Config
export interface PollingConfig {
  interval: number;
  enabled: boolean;
  maxRetries?: number;
}

// Interface untuk Polling State
export interface PollingState {
  isPolling: boolean;
  lastUpdate: Date | null;
  errorCount: number;
  isEnabled: boolean;
}

// ==================== CACHE TYPES ====================

// Interface untuk Cache Config
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  enabled: boolean;
}

// ==================== EVENT TYPES ====================

// 🆕 NEW: Image Event Types
export interface ImagePickerEvent {
  type: 'pick' | 'capture' | 'upload' | 'error' | 'permission';
  timestamp: number;
  data?: any;
  success: boolean;
}

export interface ImageLoadEvent {
  source: ImageSource;
  width: number;
  height: number;
  duration?: number;
  cache?: 'disk' | 'memory' | 'none';
}

export interface ImageErrorEvent {
  error: string;
  code?: string;
  source?: ImageSource;
  recoverable?: boolean;
}

// ==================== HOOK TYPES ====================

// 🆕 NEW: Image Hook Types
export interface UseImagePickerReturn {
  // State
  selectedImages: SimpleImageAsset[];
  productAssets: ProductImageAssets[];
  uploading: boolean;
  error: string | null;
  uploadProgress: ImageUploadProgress | null;

  // Methods - Product Images
  pickProductImages: (limit?: number) => Promise<void>;
  clearProductImages: () => Promise<void>;
  saveProductImagesToStorage: (assets: SimpleImageAsset[]) => Promise<void>;
  removeProductImage: (assetId: string) => Promise<void>;

  // Methods - Avatar/Profile
  pickAvatar: () => Promise<SimpleImageAsset | null>;
  takeAvatarPhoto: () => Promise<SimpleImageAsset | null>;
  getAvatarBase64: () => Promise<string | null>;
  saveAvatarBase64: (base64: string) => Promise<void>;

  // Methods - General
  uploadImage: (asset: SimpleImageAsset, uploadUrl: string) => Promise<boolean>;
  uploadMultipleImages: (assets: SimpleImageAsset[], uploadUrl: string) => Promise<BatchUploadResult>;
  hasCameraPermission: () => Promise<boolean>;
  hasGalleryPermission: () => Promise<boolean>;
  clearError: () => void;
  clearUploadProgress: () => void;
}

export interface UseImagePickerConfig {
  maxSelection?: number;
  enableCompression?: boolean;
  autoUpload?: boolean;
}

export interface UseAvatarReturn {
  avatarUri: string | null;
  avatarBase64: string | null;
  uploading: boolean;
  error: string | null;
  pickAvatar: () => Promise<void>;
  takeAvatarPhoto: () => Promise<void>;
  removeAvatar: () => Promise<void>;
  updateAvatar: (imageUrl: string) => Promise<void>;
}

export interface UseImageUploadReturn {
  uploading: boolean;
  progress: ImageUploadProgress | null;
  results: ImageUploadResult[];
  uploadImage: (asset: SimpleImageAsset, config: ImageUploadConfig) => Promise<ImageUploadResult>;
  uploadMultiple: (assets: SimpleImageAsset[], config: ImageUploadConfig) => Promise<BatchUploadResult>;
  cancelUpload: () => void;
  reset: () => void;
}