import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import { getToken } from '../utils/auth'

const ProtectedRoute = ({ children }) => {
  const { authLoading, user } = useAuth()
  const token = getToken()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-soft">
          <Loader2 className="h-4 w-4 animate-spin text-sky-600" aria-hidden="true" />
          Loading your workspace
        </div>
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
