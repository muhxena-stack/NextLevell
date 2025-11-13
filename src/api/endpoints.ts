// Base URL untuk API DummyJSON
export const BASE_URL = 'https://dummyjson.com';

// API Endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  
  // Product endpoints
  PRODUCTS: {
    ALL: '/products',
    BY_ID: (id: number) => `/products/${id}`,
    BY_CATEGORY: (category: string) => `/products/category/${category}`,
    CATEGORIES: '/products/categories',
    SEARCH: (query: string) => `/products/search?q=${query}`,
    LIMIT_SKIP: (limit: number, skip: number) => `/products?limit=${limit}&skip=${skip}`,
  },
  
  // Cart endpoints
  CARTS: {
    ALL: '/carts',
    BY_ID: (id: number) => `/carts/${id}`,
    BY_USER: (userId: number) => `/carts/user/${userId}`,
    ADD: '/carts/add',
    UPDATE: (id: number) => `/carts/${id}`,
    DELETE: (id: number) => `/carts/${id}`,
  },
  
  // User endpoints
  USERS: {
    ALL: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    CURRENT: '/auth/me',
  },
};

// Query parameters constants
export const QUERY_PARAMS = {
  LIMIT: 30,
  SKIP: 0,
  SELECT: 'title,price,thumbnail,category,rating,discountPercentage',
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Custom headers
export const CUSTOM_HEADERS = {
  CLIENT_PLATFORM: 'X-Client-Platform',
  USER_AGENT: 'User-Agent',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
};

export default ENDPOINTS;