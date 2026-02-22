import axios from 'axios'

const normalizeBaseUrl = (url = '') => url.replace(/\/+$/, '');

const appMode = import.meta.env.MODE;
const isDevelopment = import.meta.env.DEV || appMode === 'development';

const devBaseUrlCandidates = [
  'http://localhost:5000/api',
  import.meta.env.VITE_DEV_BASE_URL,
  'http://localhost:8000/api',
]
  .filter(Boolean)
  .map(normalizeBaseUrl)
  .filter((url, index, arr) => arr.indexOf(url) === index);

const devBaseUrl = devBaseUrlCandidates[0];
const prodBaseUrl = normalizeBaseUrl(import.meta.env.VITE_PROD_BASE_URL || '');
const baseUrl = isDevelopment ? devBaseUrl : prodBaseUrl || devBaseUrl;

const isPublicAuthRoute = (url = '') => {
  const cleanUrl = url.split('?')[0];
  return [
    '/auth/login',
    '/auth/register',
    '/auth/forget-password',
    '/auth/verify-otp',
    '/auth/update',
    '/otp/user-otp',
    '/otp/forgot',
  ].includes(cleanUrl);
};

// Create axios instance with better configuration
export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor - UPDATED TO USE JWT_TOKEN
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`🌐 API baseURL: ${config.baseURL}`);
    }

    // Get JWT token from localStorage (the actual token string)
    const jwtToken = localStorage.getItem('jwt_token');
    const isPublicRoute = isPublicAuthRoute(config.url);
    
    if (jwtToken && !isPublicRoute) {
      // Check if it's a valid JWT format
      if (jwtToken.includes('.') && jwtToken.split('.').length === 3) {
        config.headers["Authorization"] = `Bearer ${jwtToken}`;
        console.log('✅ Sending JWT token in Authorization header');
      } else {
        console.warn('⚠️ jwt_token is not a valid JWT format');
      }
    } else {
      // Login/register requests are expected to be unauthenticated.
      if (!isPublicRoute) {
        console.warn('⚠️ No jwt_token found in localStorage');
      }
      
      // Fallback: check if there's old token storage method
      if (!isPublicRoute) {
        const oldToken = localStorage.getItem('token');
        if (oldToken) {
          try {
            const userData = JSON.parse(oldToken);
            if (userData.token && userData.token.includes('.')) {
              // Use the token from the old user object
              config.headers["Authorization"] = `Bearer ${userData.token}`;
              console.log('✅ Using token from old user object');
            }
          } catch (error) {
            console.error('Cannot parse old token:', error);
          }
        }
      }
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`, config.data || '')
    }

    return config;
  },
  (error) => {
    console.error('🚨 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - FIXED TYPO (config -> response.config)
// api.js - Updated response interceptor
api.interceptors.response.use(
  (response) => {
    // Check if response is successful based on your API structure
    if (response.data && response.data.success === false) {
      const allowSuccessFalse = response.config?.allowSuccessFalse === true;
      if (allowSuccessFalse) {
        return response;
      }

      // Create a custom error for 200 responses with error messages
      const responseMessage = response.data.error || response.data.message || 'Request failed';
      const error = new Error(responseMessage);
      error.response = response;
      error.status = 400; // Set a generic error status
      error.isSuccessFalse = true;
      
      console.warn('⚠️ API returned success:false:', responseMessage);
      return Promise.reject(error);
    }
    
    if (import.meta.env.DEV) {
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    return response
  },
  (error) => {
    const isTimeout = error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '');
    const isNetworkError = error.code === 'ERR_NETWORK' || !error.response;
    const currentBaseURL = normalizeBaseUrl(error.config?.baseURL || baseUrl);
    const canRetryWithFallback =
      isDevelopment &&
      error.config &&
      !error.config._retryWithDevFallback &&
      isNetworkError;

    if (canRetryWithFallback) {
      const fallbackBaseUrl = devBaseUrlCandidates.find((candidate) => candidate !== currentBaseURL);

      if (fallbackBaseUrl) {
        console.warn(`⚠️ Retrying with fallback dev API baseURL: ${fallbackBaseUrl}`);
        // Keep using the reachable base URL for subsequent requests.
        api.defaults.baseURL = fallbackBaseUrl;
        return api.request({
          ...error.config,
          baseURL: fallbackBaseUrl,
          _retryWithDevFallback: true,
        });
      }
    }

    const timeoutMessage = 'Request timed out. Verify backend is running and VITE_DEV_BASE_URL points to the correct local API port.';

    // Only handle actual HTTP errors (404, 500, etc.)
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      message: isTimeout
        ? timeoutMessage
        : error.response?.data?.message || error.response?.data?.error || error.message,
      data: error.response?.data
    };
    
    // Log only actual HTTP errors
    if (error.response?.status !== 404) {
      console.error('🚨 API HTTP Error:', errorInfo);
    } else {
      console.warn('⚠️ API endpoint not found:', error.config?.url);
    }
    
    const enhancedError = new Error(errorInfo.message);
    enhancedError.code = error.code;
    enhancedError.details = errorInfo;
    enhancedError.originalError = error;
    enhancedError.isAxiosError = true;
    enhancedError.status = error.response?.status;
    enhancedError.response = error.response;
    
    return Promise.reject(enhancedError);
  }
);

export default api




