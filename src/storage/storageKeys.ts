// src/storage/storageKeys.ts
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: '@ecommerce:auth_token',
  USER_DATA: '@ecommerce:user_data',
  
  // Cart
  CART_ITEMS: '@ecommerce:cart_items',
  
  // Products & Categories
  CATEGORIES: '@ecommerce:categories',
  CATEGORIES_TIMESTAMP: '@ecommerce:categories_timestamp',
  
  // Settings
  THEME_PREFERENCE: '@ecommerce:theme',
  NOTIFICATION_STATUS: '@ecommerce:notifications',
  
  // Batch keys untuk multiGet
  APP_INIT_KEYS: [
    '@ecommerce:auth_token',
    '@ecommerce:user_data', 
    '@ecommerce:theme',
    '@ecommerce:notifications',
    '@ecommerce:cart_items'
  ]
} as const;