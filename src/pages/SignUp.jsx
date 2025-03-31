"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Logo from "../components/Logo"
import { authService } from "../services/api"
import "./AuthPages.css"

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { firstName, lastName, email, password, confirmPassword } = formData

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!agreeTerms) {
      setError("You must agree to the terms of use and privacy policy")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Register user
      await authService.register({
        firstName,
        lastName,
        email,
        password,
      })

      // Redirect to preferences
      navigate("/preferences")
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during registration")
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
            <div className="auth-header">
              <h1 className="auth-title">Create an account</h1>
              <Link to="/signin" className="signin-instead">
                Sign in instead
              </Link>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={firstName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={lastName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="form-input"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    By creating an account I agree to our{" "}
                    <a href="#" className="auth-link">
                      Terms of use
                    </a>{" "}
                    and{" "}
                    <a href="#" className="auth-link">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Creating account..." : "Create an account"}
              </button>
            </form>

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

export default SignUp

