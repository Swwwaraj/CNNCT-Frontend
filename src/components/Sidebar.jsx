"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import Logo from "./Logo"
import "./Sidebar.css"

const Sidebar = ({ userName, onLogout }) => {
  const location = useLocation()
  const [showLogoutOption, setShowLogoutOption] = useState(false)

  const isActive = (path) => {
    return location.pathname === path
  }

  const toggleLogoutOption = () => {
    setShowLogoutOption(!showLogoutOption)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Logo />
      </div>

      <nav className="sidebar-nav">
        <Link to="/events" className={`nav-item ${isActive("/events") ? "active" : ""}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 2L14 6H10L10.5 2H13.5Z" fill="currentColor" />
            <path d="M19.5 2L20 6H16L16.5 2H19.5Z" fill="currentColor" />
            <path d="M7.5 2L8 6H4L4.5 2H7.5Z" fill="currentColor" />
            <path
              d="M21 8H3C2.448 8 2 8.448 2 9V20C2 21.105 2.895 22 4 22H20C21.105 22 22 21.105 22 20V9C22 8.448 21.552 8 21 8Z"
              fill="currentColor"
              opacity="0.2"
            />
            <path
              d="M14 6H10L10.5 2H13.5L14 6Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 6H16L16.5 2H19.5L20 6Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 6H4L4.5 2H7.5L8 6Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 10H3V20C3 21.105 3.895 22 5 22H19C20.105 22 21 21.105 21 20V10Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 10V8C3 7.448 3.448 7 4 7H20C20.552 7 21 7.448 21 8V10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Events</span>
        </Link>

        <Link to="/booking" className={`nav-item ${isActive("/booking") ? "active" : ""}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="6" width="18" height="15" rx="2" fill="currentColor" opacity="0.2" />
            <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M19 5H5C3.895 5 3 5.895 3 7V19C3 20.105 3.895 21 5 21H19C20.105 21 21 20.105 21 19V7C21 5.895 20.105 5 19 5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M7 13H9V15H7V13Z" fill="currentColor" />
            <path d="M11 13H13V15H11V13Z" fill="currentColor" />
            <path d="M15 13H17V15H15V13Z" fill="currentColor" />
          </svg>
          <span>Booking</span>
        </Link>

        <Link to="/availability" className={`nav-item ${isActive("/availability") ? "active" : ""}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2" />
            <path
              d="M12 7V12L15 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Availability</span>
        </Link>

        <Link to="/settings" className={`nav-item ${isActive("/settings") ? "active" : ""}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
              fill="currentColor"
              opacity="0.2"
            />
            <path
              d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Settings</span>
        </Link>
      </nav>

      <div className="sidebar-actions">
        <Link to="/create-event" className="create-button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 3.33334V12.6667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.33334 8H12.6667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Create</span>
        </Link>
      </div>

      <div className="user-profile" onClick={toggleLogoutOption}>
        <div className="avatar">
          <img src="https://img.freepik.com/premium-photo/bearded-man-illustration_665280-67047.jpg?w=996" alt="User Avatar" />
        </div>
        <span className="user-name">{userName}</span>
        <button className="profile-dropdown-button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
           
          </svg>
        </button>

        {showLogoutOption && (
          <div className="profile-dropdown">
            <button className="logout-option" onClick={onLogout}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6"
                  stroke="#666"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.6667 11.3333L14 8L10.6667 4.66667"
                  stroke="#666"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M14 8H6" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar

