import axios from "axios"

// Updated API URL to use the deployed backend
const API_URL =
  process.env.NODE_ENV === "production" ? "https://cnnct-backend-4qs4.onrender.com/api" : "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Log API requests in development
const logRequest = (config) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data || "")
  }
  return config
}

// Log API responses in development
const logResponse = (response) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data)
  }
  return response
}

// Log API errors in development
const logError = (error) => {
  if (process.env.NODE_ENV !== "production") {
    console.error("API Error:", error.response?.data || error.message)
  }
  return Promise.reject(error)
}

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`
  }
  return logRequest(config)
}, logError)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(logResponse, (error) => {
  if (error.response && error.response.status === 401) {
    // If token is expired, redirect to login
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/signin"
  }
  return logError(error)
})

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData)
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
    }
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password })
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user"))
  },

  getProfile: async () => {
    const response = await api.get("/auth/me")
    return response.data
  },
}

// User services
export const userService = {
  updateDetails: async (userData) => {
    const response = await api.put("/users/updatedetails", userData)

    // Update local storage with new user data
    const currentUser = authService.getCurrentUser()
    const updatedUser = { ...currentUser, ...response.data.data }
    localStorage.setItem("user", JSON.stringify(updatedUser))

    return response.data
  },

  updatePassword: async (passwordData) => {
    const response = await api.put("/users/updatepassword", passwordData)

    // If password update is successful, update the token
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
    }

    return response.data
  },
}

// Event services
export const eventService = {
  getEvents: async () => {
    const response = await api.get("/events")
    return response.data
  },

  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`)
    return response.data
  },

  createEvent: async (eventData) => {
    const response = await api.post("/events", eventData)
    return response.data
  },

  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData)
    return response.data
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`)
    return response.data
  },

  toggleEventStatus: async (id) => {
    const response = await api.put(`/events/${id}/toggle`)
    return response.data
  },

  checkConflict: async (eventData) => {
    const response = await api.post("/events/check-conflict", eventData)
    return response.data
  },
}

// Availability services
export const availabilityService = {
  getAvailability: async () => {
    const response = await api.get("/availability")
    return response.data
  },

  updateAvailability: async (availabilityData) => {
    const response = await api.put("/availability", availabilityData)
    return response.data
  },
}

// Booking services
export const bookingService = {
  getBookings: async () => {
    const response = await api.get("/bookings")
    return response.data
  },

  getBooking: async (id) => {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  },

  createBooking: async (bookingData) => {
    const response = await api.post("/bookings", bookingData)
    return response.data
  },

  updateBookingStatus: async (id, statusData) => {
    const response = await api.put(`/bookings/${id}/status`, statusData)
    return response.data
  },

  deleteBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`)
    return response.data
  },
}

export default api

