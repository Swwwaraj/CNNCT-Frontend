import { useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import { authService } from "../services/api"
import "./DashboardLayout.css"

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    navigate("/signin")
  }

  return (
    <div className="dashboard-layout">
      <Sidebar userName={user ? `${user.firstName} ${user.lastName}` : "User"} onLogout={handleLogout} />
      <main className="dashboard-content">{children}</main>
    </div>
  )
}

export default DashboardLayout

