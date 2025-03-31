"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DashboardLayout from "../components/DashboardLayout"
import { userService, authService } from "../services/api"
import "./SettingsPage.css"

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile")
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    currentPassword: "",
  })

  useEffect(() => {
    // Load user data
    const user = authService.getCurrentUser()
    if (user) {
      setProfileData({
        ...profileData,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      setLoading(true)

      // Check if password fields are filled
      if (profileData.password || profileData.confirmPassword || profileData.currentPassword) {
        // Validate password update
        if (profileData.password !== profileData.confirmPassword) {
          setError("New passwords do not match")
          setLoading(false)
          return
        }

        if (!profileData.currentPassword) {
          setError("Current password is required to update password")
          setLoading(false)
          return
        }

        // Update password
        await userService.updatePassword({
          currentPassword: profileData.currentPassword,
          newPassword: profileData.password,
        })

        // Show success notification
        setNotification({
          type: "success",
          message: "Password updated successfully. Please log in again.",
        })

        // Log out after password change
        setTimeout(() => {
          authService.logout()
          navigate("/signin")
        }, 2000)
      } else {
        // Update profile details
        await userService.updateDetails({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
        })

        // Show success notification
        setNotification({
          type: "success",
          message: "Profile updated successfully",
        })

        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification(null)
        }, 3000)
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while updating profile")
    } finally {
      setLoading(false)
    }
  }

  const closeNotification = () => {
    setNotification(null)
  }

  return (
    <DashboardLayout>
      <div className="settings-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Profile</h1>
            <p className="page-description">Manage settings for your profile</p>
          </div>
        </div>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.type === "success" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
                  fill="white"
                />
              </svg>
            )}
            <span>{notification.message}</span>
            <button className="close-notification" onClick={closeNotification}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="settings-container">
          <div className="settings-tabs">
            <button
              className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Edit Profile
            </button>
          </div>

          {error && <div className="settings-error">{error}</div>}

          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={profileData.currentPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter current password to update password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={profileData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={profileData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage

