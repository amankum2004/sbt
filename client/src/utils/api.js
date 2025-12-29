import axios from 'axios'

const baseUrl = 
  import.meta.env.VITE_environment === 'development' 
    ? import.meta.env.VITE_DEV_BASE_URL 
    : import.meta.env.VITE_PROD_BASE_URL

// Create axios instance with better configuration
export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor - for logging and modifying requests
api.interceptors.request.use(
  (config) => {
    // ✅ Get token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      // Use standard Authorization header
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log('✅ Token added to request headers');
    }

    // Log request in development
    if (import.meta.env.VITE_environment === 'development') {
      console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`, config.data || '')
    }

    // Add timestamp to avoid caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    return config;
  },
  (error) => {
    console.error('🚨 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - PRESERVE ORIGINAL ERROR MESSAGES
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (import.meta.env.VITE_environment === 'development') {
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    return response
  },
  (error) => {
    // Preserve the original error structure - DO NOT modify error messages
    const originalError = error;
    
    // Extract useful information for logging
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.response?.data?.error || error.message,
      data: error.response?.data
    };
    
    // Log error for debugging
    console.error('🚨 API Error:', errorInfo);
    
    // For development, log the full error
    if (import.meta.env.VITE_environment === 'development') {
      console.error('Full error details:', error);
    }
    
    // Create enhanced error object BUT PRESERVE ORIGINAL MESSAGE
    const enhancedError = new Error(errorInfo.message); // Use original backend message
    enhancedError.details = {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    };
    enhancedError.originalError = originalError;
    enhancedError.isAxiosError = true;
    enhancedError.status = error.response?.status;
    enhancedError.response = error.response; // Preserve original response
    
    // IMPORTANT: Return the original error response structure for components to use
    return Promise.reject(enhancedError);
  }
);

// Alternative: SIMPLER VERSION - Just log errors, don't modify them
export const apiSimple = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Simple request interceptor (just adds auth token)
apiSimple.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Simple response interceptor (just logs, doesn't modify)
apiSimple.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just log the error, don't modify it
    console.error('API Error (simple):', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error); // Return original error
  }
);

// Utility functions for common API operations
export const apiUtils = {
  // Helper to handle API calls with loading states
  async callWithLoading(apiCall, loadingCallback = null) {
    try {
      loadingCallback?.(true)
      const response = await apiCall()
      return response.data
    } catch (error) {
      throw error
    } finally {
      loadingCallback?.(false)
    }
  },
  
  // Helper for retrying failed requests
  async retry(apiCall, maxRetries = 3, delay = 1000) {
    let lastError
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall()
      } catch (error) {
        lastError = error
        console.log(`Retry attempt ${attempt}/${maxRetries} failed:`, error.message)
        
        // Don't retry for these status codes
        if ([400, 401, 403, 404].includes(error.response?.status)) {
          break
        }
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
      }
    }
    throw lastError
  },
  
  // Helper to check if error is a network error
  isNetworkError(error) {
    return !error.response && error.request
  },
  
  // Helper to check if error is a server error
  isServerError(error) {
    return error.response && error.response.status >= 500
  },
  
  // Helper to check if error is a client error
  isClientError(error) {
    return error.response && error.response.status >= 400 && error.response.status < 500
  },
  
  // Helper to extract original backend error message
  getOriginalErrorMessage(error) {
    return error.response?.data?.message || 
           error.response?.data?.error || 
           error.message;
  },
  
  // Helper to get original response data
  getOriginalResponseData(error) {
    return error.response?.data;
  }
}

// Export default as well for flexibility
export default api

// Option 3: Export a raw axios instance with NO interceptors
export const rawApi = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Manual function to add token to rawApi
export const getAuthenticatedConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

// import axios from 'axios'

// const baseUrl = 
//   import.meta.env.VITE_environment === 'development' 
//     ? import.meta.env.VITE_DEV_BASE_URL 
//     : import.meta.env.VITE_PROD_BASE_URL
  
// export const api = axios.create({
//   baseURL: baseUrl,
//   withCredentials: true  
// })

// export default api


