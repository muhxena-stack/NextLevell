// src/security/keychainService.ts - DIPERBAIKI
import * as Keychain from 'react-native-keychain';
import { KeychainService, KeychainCredentials } from './types';

class KeychainServiceImpl implements KeychainService {
  async saveCredentials(service: string, username: string, password: string): Promise<boolean> {
    try {
      console.log(`🔐 Saving credentials to ${service} for user: ${username}`);
      
      const result = await Keychain.setGenericPassword(username, password, {
        service,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      
      return result !== false;
    } catch (error) {
      console.error(`❌ Keychain save error for ${service}:`, error);
      return false;
    }
  }

  async getCredentials(service: string): Promise<KeychainCredentials | null> {
    try {
      console.log(`🔐 Loading credentials from ${service}`);
      
      const credentials = await Keychain.getGenericPassword({ service });
      
      if (credentials) {
        return {
          username: credentials.username,
          password: credentials.password,
          service
        };
      }
      
      return null;
    } catch (error: any) {
      // ✅ Tugas c: Handle access denied errors
      if (error.message?.includes('User canceled the operation') || 
          error.message?.includes('Authentication failed') ||
          error.message?.includes('access denied') ||
          error.message?.includes('Could not decrypt')) {
        console.error(`🔐 Access denied for ${service}:`, error);
        throw new Error('KEYCHAIN_ACCESS_DENIED');
      }
      
      console.error(`❌ Keychain load error for ${service}:`, error);
      return null;
    }
  }

  async resetCredentials(service: string): Promise<boolean> {
    try {
      console.log(`🔐 Resetting credentials for ${service}`);
      
      const result = await Keychain.resetGenericPassword({ service });
      return result !== false;
    } catch (error) {
      console.error(`❌ Keychain reset error for ${service}:`, error);
      return false;
    }
  }

  async getAllServices(): Promise<string[]> {
    try {
      // ✅ DIPERBAIKI: Gunakan getAllGenericPasswordServices yang benar
      const services = await Keychain.getAllGenericPasswordServices();
      return services || [];
    } catch (error) {
      console.error('❌ Error getting keychain services:', error);
      return [];
    }
  }

  // ✅ Utility method untuk check jika service ada
  async hasCredentials(service: string): Promise<boolean> {
    const credentials = await this.getCredentials(service);
    return credentials !== null;
  }

  // ✅ Method tambahan untuk mendapatkan info keychain
  async getKeychainStatus(): Promise<{
    canSave: boolean;
    supported: boolean;
    servicesCount: number;
  }> {
    try {
      const services = await this.getAllServices();
      
      // Test if we can save to keychain
      const testSave = await this.saveCredentials(
        'com.ecom:test', 
        'test_user', 
        'test_password'
      );
      
      if (testSave) {
        await this.resetCredentials('com.ecom:test');
      }
      
      return {
        canSave: testSave,
        supported: true,
        servicesCount: services.length
      };
    } catch (error) {
      console.error('❌ Keychain status check failed:', error);
      return {
        canSave: false,
        supported: false,
        servicesCount: 0
      };
    }
  }
}

export const keychainService = new KeychainServiceImpl();