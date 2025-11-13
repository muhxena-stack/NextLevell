import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://dummyjson.com', 
  timeout: 7000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

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