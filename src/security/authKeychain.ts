// src/security/authKeychain.ts
import { keychainService } from './keychainService';
import { KEYCHAIN_SERVICES } from './keychainKeys';
import { AuthKeychain } from './types';

class AuthKeychainImpl implements AuthKeychain {
  async saveAuthToken(token: string, userId: string): Promise<boolean> {
    try {
      // ✅ Tugas a: Simpan token ke Keychain dengan namespacing spesifik
      return await keychainService.saveCredentials(
        KEYCHAIN_SERVICES.USER_AUTH, 
        userId, 
        token
      );
    } catch (error) {
      console.error('❌ Error saving auth token to keychain:', error);
      return false;
    }
  }

  async getAuthToken(): Promise<{ token: string | null; userId: string | null }> {
    try {
      // ✅ Tugas a: Ambil token dari Keychain
      const credentials = await keychainService.getCredentials(KEYCHAIN_SERVICES.USER_AUTH);
      
      if (credentials) {
        return {
          token: credentials.password,
          userId: credentials.username
        };
      }
      
      return { token: null, userId: null };
    } catch (error: any) {
      // ✅ Tugas c: Handle access denied error
      if (error.message === 'KEYCHAIN_ACCESS_DENIED') {
        console.error('🔐 Keychain access denied - security changed');
        throw new Error('KEYCHAIN_ACCESS_DENIED');
      }
      
      console.error('❌ Error getting auth token from keychain:', error);
      return { token: null, userId: null };
    }
  }

  async clearAuthToken(): Promise<boolean> {
    try {
      // ✅ Tugas d: Hapus token dari Keychain
      return await keychainService.resetCredentials(KEYCHAIN_SERVICES.USER_AUTH);
    } catch (error) {
      console.error('❌ Error clearing auth token from keychain:', error);
      return false;
    }
  }

  async hasAuthToken(): Promise<boolean> {
    const { token } = await this.getAuthToken();
    return token !== null;
  }
}

export const authKeychain = new AuthKeychainImpl();