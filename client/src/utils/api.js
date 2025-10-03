import axios from 'axios'

const baseUrl = 
  import.meta.env.VITE_environment === 'development' 
    ? import.meta.env.VITE_DEV_BASE_URL 
    : import.meta.env.VITE_PROD_BASE_URL
  
export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true  
})
