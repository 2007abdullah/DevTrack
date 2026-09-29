import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AUTH_EXPIRED_EVENT, tokenStore } from '../services/api'
import { authApi } from '../services/endpoints'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(Boolean(tokenStore.get()))

  // Restore the session from a stored token.
  useEffect(() => {
    if (!tokenStore.get()) return
    authApi.me().then(setUser).catch(() => tokenStore.clear()).finally(() => setInitializing(false))
  }, [])

  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    const { access_token, user: me } = await authApi.login({ email, password })
    tokenStore.set(access_token)
    setUser(me)
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    await authApi.register({ name, email, password })
    await login(email, password)
  }, [login])

  const logout = useCallback(() => { tokenStore.clear(); setUser(null) }, [])

  const value = useMemo(
    () => ({ user, initializing, isAuthenticated: Boolean(user), login, register, logout, setUser }),
    [user, initializing, login, register, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
