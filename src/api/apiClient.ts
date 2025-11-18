// src/api/apiClient.ts - UPDATED
import axios from 'axios';
import { apiKeyManager } from '../security/apiKeyManager';

export const apiClient = axios.create({
  baseURL: 'https://dummyjson.com', 
  timeout: 7000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ Initialize API Key Manager
apiKeyManager.initialize().then(success => {
  console.log('🔑 API Key Manager initialized:', success);
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      config.headers['X-Client-Platform'] = 'React-Native';
      
      // ✅ Tugas e: Tambahkan API Key dari Keychain ke header
      const apiKey = await apiKeyManager.getApiKey();
      
      if (apiKey) {
        config.headers['X-API-Key'] = apiKey;
        console.log('🔑 API Key added to request');
      } else {
        // ✅ Tugas e: Handle case dimana API Key tidak ditemukan
        console.error('❌ API Key not found in Keychain');
        throw new Error('UNAUTHORIZED_NO_API_KEY');
      }

      console.log(`🚀 ${config.method?.toUpperCase()} Request to: ${config.url}`);
      return config;
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED_NO_API_KEY') {
        // Simulasi 401 error
        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'Unauthorized - API Key missing' }
          }
        });
      }
      console.error('❌ Request Interceptor Error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('❌ Request Interceptor Setup Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor tetap sama...
apiClient.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes('/auth/login') && response.status === 200) {
      return {
        ...response,
        data: {
          success: true,
          token: 'simulated_token_xyz', 
          user: response.data 
        }
      };
    }
    return response;
  },
  (error) => {
    console.error('❌ Response Interceptor Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;