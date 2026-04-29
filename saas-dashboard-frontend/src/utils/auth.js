const TOKEN_KEY = 'saas_dashboard_token'
const USER_KEY = 'saas_dashboard_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = () => {
  const rawUser = localStorage.getItem(USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}

export const setAuthData = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
