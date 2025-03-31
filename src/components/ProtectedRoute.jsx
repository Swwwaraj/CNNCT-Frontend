import { Navigate } from "react-router-dom"
import { authService } from "../services/api"

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!authService.getCurrentUser()

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/signin" replace />
  }

  return children
}

export default ProtectedRoute

