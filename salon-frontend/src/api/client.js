import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3200/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  try {
    const persistedAuth = JSON.parse(localStorage.getItem('salon-auth') || '{}')
    if (persistedAuth.token) config.headers.Authorization = `Bearer ${persistedAuth.token}`
  } catch {
    localStorage.removeItem('salon-auth')
  }
  return config
})

export const getApiError = (error) => {
  const response = error.response?.data
  return response?.mensaje || response?.msg || response?.errors?.[0]?.msg || error.message || 'No fue posible conectar con el servidor.'
}

export default api