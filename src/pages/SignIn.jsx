"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Logo from "../components/Logo"
import { authService } from "../services/api"
import "./AuthPages.css"

const SignIn = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")

      // Login user
      await authService.login(email, password)

      // Redirect to dashboard
      navigate("/events")
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-logo">
            <Logo />
          </div>

          <div className="auth-form-content">
            <h1 className="auth-title">Sign in</h1>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                        fill="#777"
                      />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                        fill="#777"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Signing in..." : "Log in"}
              </button>
            </form>

            <div className="auth-links">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="auth-link">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="auth-footer">
              <p className="auth-footer-text">
                This site is protected by reCAPTCHA and the
                <a href="#" className="auth-footer-link">
                  {" "}
                  Google Privacy Policy
                </a>{" "}
                and
                <a href="#" className="auth-footer-link">
                  {" "}
                  Terms of Service
                </a>{" "}
                apply.
              </p>
            </div>
          </div>
        </div>

        <div className="auth-background">
          <img src="https://i.postimg.cc/prKhvX2C/Screenshot-2025-03-28-234817.png" alt="Background" className="background-image" />
        </div>
      </div>
    </div>
  )
}

export default SignIn

