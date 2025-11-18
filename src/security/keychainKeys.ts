// src/security/keychainKeys.ts
export const KEYCHAIN_SERVICES = {
  // ✅ Tugas a: Auth token dengan namespacing spesifik
  USER_AUTH: 'com.ecom:userToken',
  
  // ✅ Tugas e: API Key dengan service berbeda
  API_KEY: 'com.ecom:apiKey',
  
  // ✅ Services untuk future expansion
  USER_CREDENTIALS: 'com.ecom:userCredentials',
  PAYMENT_TOKEN: 'com.ecom:paymentToken'
} as const;

export type KeychainService = keyof typeof KEYCHAIN_SERVICES;