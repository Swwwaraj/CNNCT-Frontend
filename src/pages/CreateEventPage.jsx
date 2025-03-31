"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardLayout from "../components/DashboardLayout"
import { eventService } from "../services/api"
import { formatEventForBackend, calculateEndTime } from "../utils/formatters"
import "./CreateEventPage.css"

const CreateEventPage = () => {
  const navigate = useNavigate()
  const { id } = useParams() // For edit mode
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detailsSaved, setDetailsSaved] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState("/images/avatar.png")

  const [eventData, setEventData] = useState({
    topic: "",
    password: "",
    hostName: "",
    description: "",
    date: "",
    time: "02:30",
    timeFormat: "PM",
    timezone: "(UTC +5:00 Delhi)",
    duration: "1 hour",
    backgroundColor: "#0066ff",
    link: "",
    emails: "",
    meetingType: "google_meet",
  })

  useEffect(() => {
    // Get user info for host name
    const user = JSON.parse(localStorage.getItem("user"))
    if (user) {
      setEventData((prev) => ({
        ...prev,
        hostName: `${user.firstName} ${user.lastName}`,
      }))
    }

    // If in edit mode, fetch event data
    if (id) {
      setIsEditMode(true)
      fetchEventData(id)
    }
  }, [id])

  const fetchEventData = async (eventId) => {
    try {
      setLoading(true)
      const response = await eventService.getEvent(eventId)
      const event = response.data

      // Format the data for the form
      setEventData({
        topic: event.topic,
        password: event.password || "",
        hostName: eventData.hostName, // Keep the current host name
        description: event.description || "",
        date: event.date,
        time: event.startTime,
        timeFormat: event.timeFormat,
        timezone: event.timezone,
        duration: event.duration,
        backgroundColor: event.backgroundColor || "#0066ff",
        link: event.link || "",
        emails: event.emails || "",
        meetingType: event.meetingType,
      })

      // If editing, consider details already saved
      setDetailsSaved(true)
    } catch (error) {
      console.error("Error fetching event:", error)
      showNotification("Failed to load event data", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEventData({
      ...eventData,
      [name]: value,
    })
  }

  const handleColorSelect = (color) => {
    setEventData({
      ...eventData,
      backgroundColor: color,
    })
  }

  const handleAvatarClick = () => {
    fileInputRef.current.click()
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const formatDateForBackend = (dateString) => {
    // If date is already in dd/mm/yy format, return it
    if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) {
      return dateString
    }

    // Otherwise format the current date
    const today = new Date()
    const day = String(today.getDate()).padStart(2, "0")
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const year = String(today.getFullYear()).slice(-2)

    return `${day}/${month}/${year}`
  }

  const generateMeetLink = () => {
    if (eventData.meetingType === "google_meet") {
      const randomId = Math.random().toString(36).substring(2, 10)
      setEventData({
        ...eventData,
        link: `https://meet.google.com/${randomId}`,
      })
      showNotification("Google Meet link generated successfully", "success")
    }
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const checkForOverlap = async () => {
    try {
      const response = await eventService.checkConflict({
        date: eventData.date,
        startTime: eventData.time,
        endTime: calculateEndTime(eventData.time, eventData.duration, eventData.timeFormat),
        timeFormat: eventData.timeFormat,
        eventId: isEditMode ? id : undefined,
      })

      if (response.hasConflict) {
        showNotification("Warning: This event overlaps with an existing event", "warning")
        return true
      }
      return false
    } catch (error) {
      console.error("Error checking for conflicts:", error)
      return false
    }
  }

  const handleDetailsSubmit = async (e) => {
    e.preventDefault()

    if (!eventData.topic || !eventData.date || !eventData.time) {
      showNotification("Please fill in all required fields", "error")
      return
    }

    // Move to banner tab after saving details
    setDetailsSaved(true)
    setActiveTab("banner")
    showNotification("Details saved. Now customize your banner", "success")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Format date if needed
      const formattedDate = formatDateForBackend(eventData.date)

      // Check for overlapping events
      const hasOverlap = await checkForOverlap()

      // Calculate end time based on start time and duration
      const endTime = calculateEndTime(eventData.time, eventData.duration, eventData.timeFormat)

      // Prepare data for backend
      const eventPayload = formatEventForBackend({
        ...eventData,
        date: formattedDate,
        startTime: eventData.time,
        endTime,
        conflict: hasOverlap,
      })

      let response
      if (isEditMode) {
        response = await eventService.updateEvent(id, eventPayload)
        showNotification("Event updated successfully", "success")
      } else {
        response = await eventService.createEvent(eventPayload)
        showNotification("Event created successfully", "success")
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/events")
      }, 1500)
    } catch (error) {
      console.error("Error saving event:", error)
      showNotification(error.response?.data?.error || "Failed to save event", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="create-event-page">
        {notification && (
          <div className={`notification ${notification.type}`}>
            <div className="notification-content">
              {notification.type === "success" && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
                    fill="white"
                  />
                </svg>
              )}
              {notification.type === "warning" && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
                    fill="white"
                  />
                </svg>
              )}
              {notification.message}
            </div>
            <button className="close-notification" onClick={() => setNotification(null)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 4L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        <div className="page-header">
          <div>
            <h1 className="page-title">{isEditMode ? "Edit Event" : "Create Event"}</h1>
            <p className="page-description">
              {isEditMode ? "Update your event details" : "Create events to share for people to book on your calendar."}
              <br />
              Now
            </p>
          </div>
        </div>

        {loading && !eventData.topic ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading event data...</p>
          </div>
        ) : (
          <div className="event-form-container">
            <div className="event-form-header">
              <h2 className="form-title">{isEditMode ? "Edit Event" : "Add Event"}</h2>
            </div>

            <div className="event-form-tabs">
              <button
                className={`tab-button ${activeTab === "details" ? "active" : ""}`}
                onClick={() => !detailsSaved && setActiveTab("details")}
              >
                Details
              </button>
              <button
                className={`tab-button ${activeTab === "banner" ? "active" : ""}`}
                onClick={() => detailsSaved && setActiveTab("banner")}
                disabled={!detailsSaved}
              >
                Banner
              </button>
            </div>

            {activeTab === "details" ? (
              <form className="event-form" onSubmit={handleDetailsSubmit}>
                <div className="form-tab-content">
                  <div className="form-group">
                    <label className="form-label">
                      Event Topic <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="topic"
                      value={eventData.topic}
                      onChange={handleChange}
                      placeholder="Set a conference topic before it starts"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={eventData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Host name <span className="required">*</span>
                    </label>
                    <div className="select-wrapper">
                      <select
                        name="hostName"
                        value={eventData.hostName}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        <option value={eventData.hostName}>{eventData.hostName}</option>
                      </select>
                      <div className="select-arrow"></div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={eventData.description}
                      onChange={handleChange}
                      className="form-textarea"
                      rows="4"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Date and time <span className="required">*</span>
                    </label>
                    <div className="date-time-inputs">
                      <input
                        type="text"
                        name="date"
                        value={eventData.date}
                        onChange={handleChange}
                        placeholder="dd/mm/yy"
                        className="form-input date-input"
                        required
                      />

                      <div className="select-wrapper time-select">
                        <select
                          name="time"
                          value={eventData.time}
                          onChange={handleChange}
                          className="form-select"
                          required
                        >
                          <option value="02:15">02:15</option>
                          <option value="02:30">02:30</option>
                          <option value="03:00">03:00</option>
                          <option value="03:30">03:30</option>
                        </select>
                        <div className="select-arrow"></div>
                      </div>

                      <div className="select-wrapper format-select">
                        <select
                          name="timeFormat"
                          value={eventData.timeFormat}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                        <div className="select-arrow"></div>
                      </div>

                      <div className="select-wrapper timezone-select">
                        <select
                          name="timezone"
                          value={eventData.timezone}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="(UTC +5:00 Delhi)">(UTC +5:00 Delhi)</option>
                          <option value="(UTC +0:00 London)">(UTC +0:00 London)</option>
                          <option value="(UTC -5:00 New York)">(UTC -5:00 New York)</option>
                          <option value="(UTC -8:00 Los Angeles)">(UTC -8:00 Los Angeles)</option>
                        </select>
                        <div className="select-arrow"></div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Set duration</label>
                    <div className="select-wrapper duration-select">
                      <select
                        name="duration"
                        value={eventData.duration}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="30 minutes">30 minutes</option>
                        <option value="1 hour">1 hour</option>
                        <option value="1.5 hours">1.5 hours</option>
                        <option value="2 hours">2 hours</option>
                      </select>
                      <div className="select-arrow"></div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Meeting Type</label>
                    <div className="select-wrapper">
                      <select
                        name="meetingType"
                        value={eventData.meetingType}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="google_meet">Google Meet</option>
                        <option value="zoom">Zoom</option>
                        <option value="teams">Microsoft Teams</option>
                        <option value="in_person">In Person</option>
                      </select>
                      <div className="select-arrow"></div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={() => navigate("/events")}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button" disabled={loading}>
                    {loading ? "Saving..." : "Continue to Banner"}
                  </button>
                </div>
              </form>
            ) : (
              <form className="event-form" onSubmit={handleSubmit}>
                <div className="form-tab-content">
                  <div className="banner-preview">
                    <h3 className="banner-section-title">Banner</h3>
                    <div className="banner-container" style={{ backgroundColor: eventData.backgroundColor }}>
                      <div className="banner-avatar" onClick={handleAvatarClick}>
                        <img src={avatarPreview || "/placeholder.svg"} alt="User Avatar" />
                        <div className="avatar-overlay">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.3333 5.83333L14.1667 6.66667M8.33333 10.8333L10.8333 13.3333L16.6667 7.5L14.1667 5L8.33333 10.8333ZM8.33333 10.8333L7.5 13.3333L10 12.5L8.33333 10.8333Z"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12.5 3.33333L13.3333 2.5L17.5 6.66667L16.6667 7.5"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M11.6667 4.16667L3.33333 12.5V17.5H8.33333L16.6667 9.16667"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                      <div className="banner-title">
                        <span>{eventData.topic || "Team A Meeting-1"}</span>
                        <button type="button" className="edit-banner-title">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.33333 2.66667L13.3333 6.66667L5.33333 14.6667H1.33333V10.6667L9.33333 2.66667Z"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="color-options">
                      <h4 className="color-section-title">Custom Background Color</h4>
                      <div className="color-swatches">
                        <button
                          type="button"
                          className={`color-swatch orange ${eventData.backgroundColor === "#FF6B00" ? "selected" : ""}`}
                          onClick={() => handleColorSelect("#FF6B00")}
                        ></button>
                        <button
                          type="button"
                          className={`color-swatch blue ${eventData.backgroundColor === "#0066FF" ? "selected" : ""}`}
                          onClick={() => handleColorSelect("#0066FF")}
                        ></button>
                        <button
                          type="button"
                          className={`color-swatch green ${eventData.backgroundColor === "#10B981" ? "selected" : ""}`}
                          onClick={() => handleColorSelect("#10B981")}
                        ></button>
                        <button
                          type="button"
                          className={`color-swatch purple ${eventData.backgroundColor === "#8B5CF6" ? "selected" : ""}`}
                          onClick={() => handleColorSelect("#8B5CF6")}
                        ></button>
                        <button
                          type="button"
                          className={`color-swatch black ${eventData.backgroundColor === "#000000" ? "selected" : ""}`}
                          onClick={() => handleColorSelect("#000000")}
                        ></button>
                      </div>

                      <div className="color-input-container">
                        <div className="color-preview" style={{ backgroundColor: eventData.backgroundColor }}></div>
                        <input
                          type="text"
                          name="backgroundColor"
                          value={eventData.backgroundColor}
                          onChange={handleChange}
                          className="color-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Add link <span className="required">*</span>
                    </label>
                    <div className="link-input-group">
                      <input
                        type="url"
                        name="link"
                        value={eventData.link}
                        onChange={handleChange}
                        placeholder="Enter URL Here"
                        className="form-input"
                        required
                      />
                      {eventData.meetingType === "google_meet" && (
                        <button type="button" className="generate-link-button" onClick={generateMeetLink}>
                          Generate Meet Link
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Add Emails <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="emails"
                      value={eventData.emails}
                      onChange={handleChange}
                      placeholder="Add member Emails"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={() => setActiveTab("details")}>
                    Back
                  </button>
                  <button type="submit" className="save-button" disabled={loading}>
                    {loading ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default CreateEventPage

