import { Loader2 } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()
  if (initializing) {
    return <div className="grid min-h-screen place-items-center" role="status" aria-label="Loading"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
