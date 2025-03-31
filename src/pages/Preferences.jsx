"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Logo from "../components/Logo"
import "./Preferences.css"

const categories = [
  { id: "sales", name: "Sales", icon: "💼" },
  { id: "education", name: "Education", icon: "🎓" },
  { id: "finance", name: "Finance", icon: "💰" },
  { id: "government", name: "Government & Politics", icon: "🏛️" },
  { id: "consulting", name: "Consulting", icon: "📊" },
  { id: "recruiting", name: "Recruiting", icon: "👥" },
  { id: "tech", name: "Tech", icon: "💻" },
  { id: "marketing", name: "Marketing", icon: "📈" },
]

const Preferences = () => {
  const [username, setUsername] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would save preferences here
    console.log("Saving preferences:", { username, selectedCategory })
    navigate("/events") // Redirect to events page after preferences
  }

  return (
    <div className="auth-page preferences-page">
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-logo">
            <Logo />
          </div>

          <div className="auth-form-content">
            <h1 className="auth-title">Your Preferences</h1>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Tell us your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="category-section">
                <h2 className="category-title">Select one category that best describes your CNNCT:</h2>

                <div className="category-grid">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`category-card ${selectedCategory === category.id ? "selected" : ""}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="category-icon">{category.icon}</span>
                      <span className="category-name">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="auth-button continue-button" disabled={!username || !selectedCategory}>
                Continue
              </button>
            </form>
          </div>
        </div>

        <div className="auth-background">
          <img src="https://i.postimg.cc/prKhvX2C/Screenshot-2025-03-28-234817.png" alt="Background" className="background-image" />
        </div>
      </div>
    </div>
  )
}

export default Preferences

