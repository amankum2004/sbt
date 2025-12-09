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
    // ✅ ADD USER HEADER (NON-BREAKING)
    const user = localStorage.getItem("token");
    if (user) {
      config.headers["x-user"] = user;
    }

    // Log request in development
    if (import.meta.env.VITE_environment === 'development') {
      // console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`, config.data || '')
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


// Response interceptor - for handling responses and errors globally
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (import.meta.env.VITE_environment === 'development') {
      // console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    return response
  },
  (error) => {
    // Enhanced error handling
    let errorMessage = 'An unexpected error occurred'
    let errorDetails = {}
    
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      const { status, data } = error.response
      
      errorDetails = {
        status,
        message: data?.message || data?.error || `Server error: ${status}`,
        data: data
      }
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Bad request. Please check your input.'
          break
        case 401:
          errorMessage = 'Unauthorized. Please log in again.'
          // Optional: Redirect to login page
          // window.location.href = '/login'
          break
        case 403:
          errorMessage = 'Access forbidden. You do not have permission.'
          break
        case 404:
          errorMessage = data?.message || 'Requested resource not found.'
          break
        case 409:
          errorMessage = data?.message || 'Conflict. Resource already exists.'
          break
        case 422:
          errorMessage = data?.message || 'Validation error. Please check your input.'
          break
        case 429:
          errorMessage = 'Too many requests. Please try again later.'
          break
        case 500:
          errorMessage = data?.message || 'Internal server error. Please try again later.'
          break
        case 502:
          errorMessage = 'Bad gateway. Server is temporarily unavailable.'
          break
        case 503:
          errorMessage = 'Service unavailable. Please try again later.'
          break
        default:
          errorMessage = data?.message || `Server error: ${status}`
      }
      
    } else if (error.request) {
      // Request was made but no response received
      errorDetails = {
        status: null,
        message: 'No response received from server'
      }
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.'
        errorDetails.message = 'Request timeout'
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection.'
        errorDetails.message = 'Network error'
      } else {
        errorMessage = 'Unable to connect to server. Please try again.'
      }
      
    } else {
      // Something else happened while setting up the request
      errorDetails = {
        status: null,
        message: error.message
      }
      errorMessage = error.message || 'Request configuration error'
    }
    
    // Log error with details
    console.error('🚨 API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      message: errorMessage,
      details: errorDetails,
      originalError: error
    })
    
    // Create enhanced error object
    const enhancedError = new Error(errorMessage)
    enhancedError.details = errorDetails
    enhancedError.originalError = error
    enhancedError.isAxiosError = true
    enhancedError.status = errorDetails.status
    
    return Promise.reject(enhancedError)
  }
)

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
  }
}

// Export default as well for flexibility
export default api


// import axios from 'axios'

// const baseUrl = 
//   import.meta.env.VITE_environment === 'development' 
//     ? import.meta.env.VITE_DEV_BASE_URL 
//     : import.meta.env.VITE_PROD_BASE_URL
  
// export const api = axios.create({
//   baseURL: baseUrl,
//   withCredentials: true  
// })
