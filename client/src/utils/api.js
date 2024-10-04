import axios from 'axios'

const baseUrl =
  import.meta.env.VITE_environment === 'development'
    ? 'http://localhost:8000/api'
    : 'https://salonbookingtime.vercel.app/api'
  // import.meta.env.VITE_environment === 'http://localhost:8000/api'
  
export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true
})
