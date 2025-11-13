// src/types/types.ts

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

// ==================== CART TYPES ====================

// Interface untuk Item dalam Keranjang
export interface CartItem {
  product: Product;
  quantity: number;
}

// Interface untuk Context Keranjang
export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void; 
  removeFromCart: (productId: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
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

// ==================== ERROR HANDLING TYPES ====================

// Unified Error Interface - FIXED: Hanya AppError saja
export interface AppError {
  code: string; // Wajib string, tidak boleh undefined
  message: string;
  details?: any;
  status?: number;
}

// HAPUS ApiError - hanya gunakan AppError

// ==================== COMPONENT PROP TYPES ====================

// Interface untuk Props ProductItem
export interface ProductItemProps {
  product: Product;
  onPress: (product: Product) => void; 
  itemWidth: string;
}

// Interface untuk Props AddProductModal
export interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newProduct: Product) => void; 
}

// Interface untuk Props ProductCatalogScreen
export interface ProductCatalogScreenProps {
  filter?: string;
}

// ==================== NAVIGATION TYPES ====================

// Type untuk Navigation Params
export type HomeStackParamList = {
  HomeTabs: undefined;
  ProductDetail: { product: Product };
  ProductList: undefined;
  Cart: undefined;
  Checkout: { product: Product };
};

export type DrawerParamList = {
  MainTabs: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

// ==================== AUTHENTICATION TYPES ====================

// Interface untuk User (Authentication)
export interface User {
  id: string;
  nama: string;
  email: string;
}

// Interface untuk Auth Context
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  userID: string;
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
  harga: string; // string karena input dari TextInput
  deskripsi: string;
  urlGambar: string;
  kategori: string;
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

// Interface untuk Service Response - FIXED
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

// ==================== UTILITY TYPES ====================

// Simple utility types tanpa circular reference
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type MakeRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };

// Type untuk Dimension Value (React Native)
export type DimensionValue = number | string | undefined;

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