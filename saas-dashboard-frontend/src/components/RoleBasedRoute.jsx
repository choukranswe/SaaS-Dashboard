import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default RoleBasedRoute
