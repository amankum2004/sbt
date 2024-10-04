import axios from 'axios'

// : 'https://salonbookingtime.vercel.app/api'
const baseUrl =
  import.meta.env.VITE_environment === 'development'
    ? 'http://localhost:8000/api'
    : 'https://sbt-2wmtk690j-amankum2004s-projects.vercel.app/api'
  
export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true
})
