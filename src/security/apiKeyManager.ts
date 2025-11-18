// src/security/apiKeyManager.ts
import { keychainService } from './keychainService';
import { KEYCHAIN_SERVICES } from './keychainKeys';
import { ApiKeyManager } from './types';

class ApiKeyManagerImpl implements ApiKeyManager {
  private readonly API_CLIENT_USERNAME = 'api_client';
  private readonly STATIC_API_KEY = 'API_KEY_SECRET_XYZ_123456'; // ✅ Simulasi API Key

  async saveApiKey(apiKey?: string): Promise<boolean> {
    try {
      const keyToSave = apiKey || this.STATIC_API_KEY;
      
      // ✅ Tugas e: Simpan API Key ke Keychain dengan service berbeda
      return await keychainService.saveCredentials(
        KEYCHAIN_SERVICES.API_KEY,
        this.API_CLIENT_USERNAME,
        keyToSave
      );
    } catch (error) {
      console.error('❌ Error saving API key to keychain:', error);
      return false;
    }
  }

  async getApiKey(): Promise<string | null> {
    try {
      const credentials = await keychainService.getCredentials(KEYCHAIN_SERVICES.API_KEY);
      
      if (credentials && credentials.password) {
        return credentials.password;
      }
      
      return null;
    } catch (error: any) {
      if (error.message === 'KEYCHAIN_ACCESS_DENIED') {
        console.error('🔐 API Key access denied');
        throw new Error('API_KEY_ACCESS_DENIED');
      }
      
      console.error('❌ Error getting API key from keychain:', error);
      return null;
    }
  }

  async clearApiKey(): Promise<boolean> {
    try {
      return await keychainService.resetCredentials(KEYCHAIN_SERVICES.API_KEY);
    } catch (error) {
      console.error('❌ Error clearing API key from keychain:', error);
      return false;
    }
  }

  // ✅ Initialize dengan static API Key
  async initialize(): Promise<boolean> {
    const existingKey = await this.getApiKey();
    if (!existingKey) {
      return await this.saveApiKey();
    }
    return true;
  }
}

export const apiKeyManager = new ApiKeyManagerImpl();