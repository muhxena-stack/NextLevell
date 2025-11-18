// src/security/types.ts
export interface KeychainCredentials {
  username: string;
  password: string;
  service?: string;
}

export interface KeychainService {
  saveCredentials(service: string, username: string, password: string): Promise<boolean>;
  getCredentials(service: string): Promise<KeychainCredentials | null>;
  resetCredentials(service: string): Promise<boolean>;
  getAllServices(): Promise<string[]>;
}

export interface AuthKeychain {
  saveAuthToken(token: string, userId: string): Promise<boolean>;
  getAuthToken(): Promise<{ token: string | null; userId: string | null }>;
  clearAuthToken(): Promise<boolean>;
  hasAuthToken(): Promise<boolean>;
}

export interface ApiKeyManager {
  saveApiKey(apiKey: string): Promise<boolean>;
  getApiKey(): Promise<string | null>;
  clearApiKey(): Promise<boolean>;
}