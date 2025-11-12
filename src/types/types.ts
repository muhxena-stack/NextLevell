// src/types/types.ts

// Interface untuk Produk
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

// Interface untuk Form Tambah Produk
export interface AddProductForm {
    nama: string;
    harga: string; // string karena input dari TextInput
    deskripsi: string;
    urlGambar: string;
    kategori: string;
}

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

// Type untuk Navigation Params
export type HomeStackParamList = {
  HomeTabs: undefined;
  ProductDetail: { product: Product };
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
}

// Interface untuk Responsive Utilities
export interface GridConfig {
  columns: number;
  spacing: number;
  margin: number;
}

// Type untuk Breakpoints
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

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

// Utility Types yang FIXED (tanpa circular reference)
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

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

// Type untuk Error Handling
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

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

// Simple utility types tanpa circular reference
export type MakeRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };