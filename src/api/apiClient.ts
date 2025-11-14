// src/api/apiClient.ts - UPDATE dengan error interceptor
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://dummyjson.com', 
  timeout: 7000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    config.headers['X-Client-Platform'] = 'React-Native';
    
    console.log(`🚀 ${config.method?.toUpperCase()} Request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor untuk handle 400 errors
apiClient.interceptors.response.use(
  (response) => {
    // Handle successful login response
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
    // ✅ Handle 400 Bad Request (Validation Errors)
    if (error.response?.status === 400) {
      const validationErrors = error.response.data?.errors;
      
      if (validationErrors) {
        console.error('❌ Validation Errors:', validationErrors);
        
        // Transform error untuk field-specific handling
        const fieldErrors: Record<string, string> = {};
        
        Object.keys(validationErrors).forEach(field => {
          fieldErrors[field] = validationErrors[field];
        });
        
        // Reject dengan structured error
        return Promise.reject({
          ...error,
          isValidationError: true,
          fieldErrors: fieldErrors
        });
      }
    }
    
    // Handle other errors
    console.error('❌ Response Interceptor Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;