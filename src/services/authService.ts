// src/services/authService.ts
import { apiClient } from '../api/apiClient';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user?: any;
}

export const authService = {
  // POST login dengan handling credentials sederhana
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      console.log('🔐 Sending login request:', credentials);
      
      // Check credentials sederhana terlebih dahulu
      const simpleCredentials = [
        { username: 'admin', password: '123456' },
        { username: 'user', password: 'password' },
        { username: 'test', password: 'test123' }
      ];
      
      const isSimpleCredential = simpleCredentials.some(
        cred => cred.username === credentials.username && cred.password === credentials.password
      );
      
      if (isSimpleCredential) {
        console.log('✅ Using simple credentials');
        // Return success langsung untuk credentials sederhana
        return {
          success: true,
          token: 'simple_token_' + Date.now(),
          user: {
            id: 1,
            username: credentials.username,
            email: `${credentials.username}@example.com`,
            firstName: 'Demo',
            lastName: 'User',
          }
        };
      }
      
      // Untuk credentials lain, gunakan DummyJSON API
      console.log('🌐 Using DummyJSON API');
      const response = await apiClient.post('/auth/login', credentials);
      console.log('📡 API Response:', response.data);
      
      return {
        success: true,
        token: response.data.token,
        user: response.data
      };
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Jika error dari API, throw error asli
      if (error.response) {
        throw error;
      }
      
      // Untuk error lain, throw error custom
      throw new Error('Login failed: ' + (error.message || 'Unknown error'));
    }
  },

  // Simulasi logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
      console.log('🔓 Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  }
};