import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { clearAuthData, getStoredUser, getToken, setAuthData } from '../utils/auth'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser())
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const syncUser = async () => {
      const token = getToken()

      if (!token) {
        setUser(null)
        setAuthLoading(false)
        return
      }

      try {
        const { data } = await api.get('/me')
        setUser(data.user)
        setAuthData(token, data.user)
      } catch {
        clearAuthData()
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    syncUser()
  }, [])

  const saveSession = (token, currentUser) => {
    setAuthData(token, currentUser)
    setUser(currentUser)
  }

  const logout = async () => {
    try {
      if (getToken()) {
        await api.post('/logout')
      }
    } catch {
      // Ignore API logout errors; local cleanup still logs the user out.
    } finally {
      clearAuthData()
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({
      user,
      authLoading,
      saveSession,
      logout,
      setUser,
    }),
    [user, authLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
