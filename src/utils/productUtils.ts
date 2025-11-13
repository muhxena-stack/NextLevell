// src/utils/productUtils.ts
import { Product, ApiProduct } from '../types/types';

// Utility function to get product name regardless of type
export const getProductName = (product: Product | ApiProduct): string => {
  return 'title' in product ? product.title : product.nama;
};

// Utility function to get product image
export const getProductImage = (product: Product | ApiProduct): string | undefined => {
  if ('thumbnail' in product && product.thumbnail) {
    return product.thumbnail;
  }
  if ('urlGambar' in product && product.urlGambar) {
    return product.urlGambar;
  }
  if ('images' in product && product.images && product.images.length > 0) {
    return product.images[0];
  }
  return undefined;
};

// Utility function to get product price
export const getProductPrice = (product: Product | ApiProduct): number => {
  return 'price' in product ? product.price : product.harga;
};

// Utility function to get product description
export const getProductDescription = (product: Product | ApiProduct): string => {
  return 'description' in product ? product.description : product.deskripsi;
};

// Utility function to get product category
export const getProductCategory = (product: Product | ApiProduct): string => {
  return 'category' in product ? product.category : product.kategori;
};

// Convert ApiProduct to Product for consistency
export const convertApiProductToProduct = (apiProduct: ApiProduct): Product => {
  return {
    id: apiProduct.id,
    nama: apiProduct.title,
    harga: apiProduct.price,
    urlGambar: apiProduct.thumbnail || (apiProduct.images && apiProduct.images[0]),
    deskripsi: apiProduct.description,
    kategori: apiProduct.category,
    rating: apiProduct.rating,
    terjual: Math.floor(Math.random() * 100) + 1, // Random sold count for demo
  };
};

// Convert Product to ApiProduct (if needed)
export const convertProductToApiProduct = (product: Product): ApiProduct => {
  return {
    id: product.id,
    title: product.nama,
    description: product.deskripsi,
    price: product.harga,
    discountPercentage: 0, // Default value
    rating: product.rating || 4.0, // Default rating
    stock: 100, // Default stock
    brand: 'Unknown', // Default brand
    category: product.kategori,
    thumbnail: product.urlGambar || '',
    images: product.urlGambar ? [product.urlGambar] : [],
  };
};

// Check if product is ApiProduct
export const isApiProduct = (product: Product | ApiProduct): product is ApiProduct => {
  return 'title' in product;
};

// Check if product is local Product
export const isLocalProduct = (product: Product | ApiProduct): product is Product => {
  return 'nama' in product;
};

// Get product rating with fallback
export const getProductRating = (product: Product | ApiProduct): number => {
  return product.rating || 4.0; // Default rating if not available
};

// Format price to Indonesian Rupiah
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

// Format price for API products (USD)
export const formatApiPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Get appropriate price formatter based on product type
export const getPriceFormatter = (product: Product | ApiProduct) => {
  return isApiProduct(product) ? formatApiPrice : formatPrice;
};

// Filter products by category
export const filterProductsByCategory = (
  products: (Product | ApiProduct)[], 
  category: string
): (Product | ApiProduct)[] => {
  if (category === 'all') return products;
  
  return products.filter(product => 
    getProductCategory(product).toLowerCase() === category.toLowerCase()
  );
};

// Search products by name/title
export const searchProducts = (
  products: (Product | ApiProduct)[], 
  query: string
): (Product | ApiProduct)[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(product => 
    getProductName(product).toLowerCase().includes(lowerQuery) ||
    getProductDescription(product).toLowerCase().includes(lowerQuery)
  );
};

// Sort products by various criteria
export const sortProducts = (
  products: (Product | ApiProduct)[], 
  sortBy: 'name' | 'price' | 'rating' | 'newest'
): (Product | ApiProduct)[] => {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => getProductName(a).localeCompare(getProductName(b)));
    
    case 'price':
      return sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    case 'newest':
      return sorted.sort((a, b) => b.id - a.id);
    
    default:
      return sorted;
  }
};

// Get unique categories from products
export const getUniqueCategories = (products: (Product | ApiProduct)[]): string[] => {
  const categories = products.map(product => getProductCategory(product));
  return [...new Set(categories)].sort();
};

// Validate product data
export const validateProduct = (product: Partial<Product>): string[] => {
  const errors: string[] = [];
  
  if (!product.nama || product.nama.trim().length === 0) {
    errors.push('Nama produk harus diisi');
  }
  
  if (!product.harga || product.harga <= 0) {
    errors.push('Harga produk harus lebih dari 0');
  }
  
  if (!product.deskripsi || product.deskripsi.trim().length === 0) {
    errors.push('Deskripsi produk harus diisi');
  }
  
  if (!product.kategori || product.kategori.trim().length === 0) {
    errors.push('Kategori produk harus diisi');
  }
  
  return errors;
};

// Generate mock product ID (for local products)
export const generateProductId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};