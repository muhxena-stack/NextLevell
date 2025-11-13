// src/utils/constants.ts

// Network constants
export const NETWORK_CONSTANTS = {
  TIMEOUT: {
    DEFAULT: 10000, // 10 seconds
    SHORT: 5000,    // 5 seconds
    LONG: 30000,    // 30 seconds
  },
  POLLING_INTERVAL: {
    NORMAL: 15000,  // 15 seconds
    SLOW: 30000,    // 30 seconds
    FAST: 5000,     // 5 seconds
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,    // 1 second
  },
};

// API constants
export const API_CONSTANTS = {
  BASE_URL: 'https://dummyjson.com',
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Platform': 'React-Native',
  },
};

// App constants
export const APP_CONSTANTS = {
  APP_NAME: 'Mini E-Commerce',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@miniecommerce.com',
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  NETWORK_STATUS: 'network_status',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: {
    OFFLINE: 'Anda sedang offline. Periksa koneksi internet Anda.',
    TIMEOUT: 'Request timeout. Silakan coba lagi.',
    GENERIC: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
  },
  API: {
    UNAUTHORIZED: 'Sesi telah berakhir. Silakan login kembali.',
    NOT_FOUND: 'Data tidak ditemukan.',
    SERVER_ERROR: 'Terjadi kesalahan server. Silakan coba lagi nanti.',
  },
  VALIDATION: {
    REQUIRED: 'Field ini wajib diisi.',
    EMAIL: 'Format email tidak valid.',
    PASSWORD: 'Password harus minimal 6 karakter.',
  },
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login berhasil!',
  LOGOUT: 'Logout berhasil!',
  PRODUCT_ADDED: 'Produk berhasil ditambahkan!',
  CART_UPDATED: 'Keranjang berhasil diperbarui!',
  ORDER_CREATED: 'Pesanan berhasil dibuat!',
};

// Demo credentials for testing
export const DEMO_CREDENTIALS = {
  USERNAME: 'kminchelle',
  PASSWORD: '0lelplR',
};

export default {
  NETWORK_CONSTANTS,
  API_CONSTANTS,
  APP_CONSTANTS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEMO_CREDENTIALS,
};