import axios from 'axios'
import { toApiError } from '../utils/errors'

const TOKEN_KEY = 'devtrack_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const AUTH_EXPIRED_EVENT = 'devtrack:auth-expired'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const apiError = toApiError(error)
    const isLoginCall = error.config?.url?.includes('/auth/login')
    if (apiError.status === 401 && !isLoginCall && tokenStore.get()) {
      tokenStore.clear()
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    return Promise.reject(apiError)
  },
)

export default api
