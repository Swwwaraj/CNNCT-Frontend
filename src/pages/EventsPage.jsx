"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import DashboardLayout from "../components/DashboardLayout"
import { eventService } from "../services/api"
import { formatEventFromBackend } from "../utils/formatters"
import "./EventsPage.css"

const EventsPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [showEventMenu, setShowEventMenu] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventService.getEvents()

      // Check for locally stored events
      const localEvents = JSON.parse(localStorage.getItem("createdEvents") || "[]")

      // Format events from backend
      let formattedEvents = []

      if (response.data && response.data.data && response.data.data.length > 0) {
        formattedEvents = response.data.data.map((event) => formatEventFromBackend(event))
      }

      // Combine API events with locally stored events
      const combinedEvents = [...formattedEvents, ...localEvents]

      if (combinedEvents.length > 0) {
        setEvents(combinedEvents)
      } else {
        // If no events are returned, create some mock events for display
        setEvents([
          {
            id: "mock1",
            title: "Team Meeting",
            date: "Mon, 28 Mar",
            startTime: "10:00 AM",
            endTime: "11:00 AM",
            type: "Google Meet",
            active: true,
            conflict: false,
            link: "https://meet.google.com/abc-defg-hij",
            backgroundColor: "#0066ff",
          },
          {
            id: "mock2",
            title: "Project Review",
            date: "Tue, 29 Mar",
            startTime: "2:30 PM",
            endTime: "3:30 PM",
            type: "Zoom",
            active: true,
            conflict: false,
            link: "https://zoom.us/j/123456789",
            backgroundColor: "#FF6B00",
          },
          {
            id: "mock3",
            title: "Client Presentation",
            date: "Wed, 30 Mar",
            startTime: "1:00 PM",
            endTime: "2:00 PM",
            type: "Microsoft Teams",
            active: true,
            conflict: true,
            link: "https://teams.microsoft.com/l/meetup-join/123",
            backgroundColor: "#10B981",
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      showNotification("Failed to load events", "error")

      // Set mock events even if there's an error
      setEvents([
        {
          id: "mock1",
          title: "Team Meeting",
          date: "Mon, 28 Mar",
          startTime: "10:00 AM",
          endTime: "11:00 AM",
          type: "Google Meet",
          active: true,
          conflict: false,
          link: "https://meet.google.com/abc-defg-hij",
          backgroundColor: "#0066ff",
        },
        {
          id: "mock2",
          title: "Project Review",
          date: "Tue, 29 Mar",
          startTime: "2:30 PM",
          endTime: "3:30 PM",
          type: "Zoom",
          active: true,
          conflict: false,
          link: "https://zoom.us/j/123456789",
          backgroundColor: "#FF6B00",
        },
        {
          id: "mock3",
          title: "Client Presentation",
          date: "Wed, 30 Mar",
          startTime: "1:00 PM",
          endTime: "2:00 PM",
          type: "Microsoft Teams",
          active: true,
          conflict: true,
          link: "https://teams.microsoft.com/l/meetup-join/123",
          backgroundColor: "#10B981",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const toggleEventStatus = async (id) => {
    try {
      // For mock events, just update the local state
      if (id.startsWith("mock")) {
        setEvents(events.map((event) => (event.id === id ? { ...event, active: !event.active } : event)))
        showNotification("Event status updated successfully")
        return
      }

      // For real events, call the API
      await eventService.toggleEventStatus(id)
      // Update the local state
      setEvents(events.map((event) => (event.id === id ? { ...event, active: !event.active } : event)))
      showNotification("Event status updated successfully")
    } catch (error) {
      console.error("Error toggling event status:", error)
      showNotification("Failed to update event status", "error")
    }
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const copyEventLink = (event) => {
    if (event && event.link) {
      navigator.clipboard.writeText(event.link)
      showNotification("Successfully copied link")
    } else {
      showNotification("No link available to copy", "warning")
    }
    setShowEventMenu(null)
  }

  const deleteEvent = async (id) => {
    try {
      // For mock events, just update the local state
      if (id.startsWith("mock")) {
        setEvents(events.filter((event) => event.id !== id))
        showNotification("Event deleted successfully")
        setShowEventMenu(null)
        return
      }

      // For real events, call the API
      await eventService.deleteEvent(id)
      setEvents(events.filter((event) => event.id !== id))
      showNotification("Event deleted successfully")
      setShowEventMenu(null)
    } catch (error) {
      console.error("Error deleting event:", error)
      showNotification("Failed to delete event", "error")
    }
  }

  const toggleEventMenu = (id) => {
    setShowEventMenu(showEventMenu === id ? null : id)
  }

  return (
    <DashboardLayout>
      <div className="events-page">
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
              {notification.type === "error" && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
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
            <h1 className="page-title">Event Types</h1>
            <p className="page-description">
              Create events to share for people to book on your calendar.
              <br />
              Now
            </p>
          </div>
          <Link to="/create-event" className="add-event-button">
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
            Add New Event
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : (
          <div className="events-grid">
            {events && events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className={`event-card ${!event.active ? "inactive" : ""}`}>

                  <div className="event-header" style={{ borderTopColor: event.backgroundColor || "#0066ff" }}>
                    <h2 className="event-title">{event.title}</h2>
                    <button className="menu-button" onClick={() => toggleEventMenu(event.id)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8 3.33333C8.55228 3.33333 9 2.88562 9 2.33333C9 1.78105 8.55228 1.33333 8 1.33333C7.44772 1.33333 7 1.78105 7 2.33333C7 2.88562 7.44772 3.33333 8 3.33333Z"
                          fill="#666"
                        />
                        <path
                          d="M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z"
                          fill="#666"
                        />
                        <path
                          d="M8 14.6667C8.55228 14.6667 9 14.219 9 13.6667C9 13.1144 8.55228 12.6667 8 12.6667C7.44772 12.6667 7 13.1144 7 13.6667C7 14.219 7.44772 14.6667 8 14.6667Z"
                          fill="#666"
                        />
                      </svg>
                    </button>

                    {showEventMenu === event.id && (
                      <div className="event-menu">
                        <Link to={`/edit-event/${event.id}`} className="menu-item">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.33333 2.66667L13.3333 6.66667L5.33333 14.6667H1.33333V10.6667L9.33333 2.66667Z"
                              stroke="#666"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Edit
                        </Link>
                        <button className="menu-item" onClick={() => copyEventLink(event)}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.66667 8.66667C7.05556 9.11111 7.55556 9.44444 8.11111 9.66667C8.66667 9.88889 9.27778 9.94444 9.88889 9.88889C10.5 9.83333 11.0556 9.66667 11.5556 9.38889C12.0556 9.11111 12.5 8.77778 12.8333 8.33333L14.5 6.33333C15.0556 5.66667 15.3333 4.83333 15.3333 4C15.3333 3.16667 15.0556 2.33333 14.5 1.66667C13.9444 1 13.1667 0.611111 12.3333 0.611111C11.5 0.611111 10.7222 1 10.1667 1.66667L9.27778 2.72222"
                              stroke="#666"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9.33333 7.33333C8.94444 6.88889 8.44444 6.55556 7.88889 6.33333C7.33333 6.11111 6.72222 6.05556 6.11111 6.11111C5.5 6.16667 4.94444 6.33333 4.44444 6.61111C3.94444 6.88889 3.5 7.22222 3.16667 7.66667L1.5 9.66667C0.944444 10.3333 0.666667 11.1667 0.666667 12C0.666667 12.8333 0.944444 13.6667 1.5 14.3333C2.05556 15 2.83333 15.3889 3.66667 15.3889C4.5 15.3889 5.27778 15 5.83333 14.3333L6.72222 13.2778"
                              stroke="#666"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Copy Link
                        </button>
                        <button className="menu-item delete" onClick={() => deleteEvent(event.id)}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 4H3.33333H14"
                              stroke="#FF3B30"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5.33334 4V2.66667C5.33334 2.31305 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31305 1.33334 6.66667 1.33334H9.33334C9.68696 1.33334 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33334 13.687 3.33334 13.3333V4H12.6667Z"
                              stroke="#FF3B30"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="event-details">
                    <p className="event-date">{event.date}</p>
                    <p className="event-time">
                      {event.startTime} - {event.endTime}
                    </p>
                    <p className="event-type">{event.type}</p>
                  </div>

                  <div className="event-actions">
                    <label className="toggle">
                      <input type="checkbox" checked={event.active} onChange={() => toggleEventStatus(event.id)} />
                      <span className="toggle-slider"></span>
                    </label>

                    <button className="action-button" onClick={() => deleteEvent(event.id)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M2 4H3.33333H14"
                          stroke="#666"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5.33334 4V2.66667C5.33334 2.31305 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31305 1.33334 6.66667 1.33334H9.33334C9.68696 1.33334 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33334 13.687 3.33334 13.3333V4H12.6667Z"
                          stroke="#666"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <button className="action-button" onClick={() => copyEventLink(event)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6.66667 8.66667C7.05556 9.11111 7.55556 9.44444 8.11111 9.66667C8.66667 9.88889 9.27778 9.94444 9.88889 9.88889C10.5 9.83333 11.0556 9.66667 11.5556 9.38889C12.0556 9.11111 12.5 8.77778 12.8333 8.33333L14.5 6.33333C15.0556 5.66667 15.3333 4.83333 15.3333 4C15.3333 3.16667 15.0556 2.33333 14.5 1.66667C13.9444 1 13.1667 0.611111 12.3333 0.611111C11.5 0.611111 10.7222 1 10.1667 1.66667L9.27778 2.72222"
                          stroke="#666"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.33333 7.33333C8.94444 6.88889 8.44444 6.55556 7.88889 6.33333C7.33333 6.11111 6.72222 6.05556 6.11111 6.11111C5.5 6.16667 4.94444 6.33333 4.44444 6.61111C3.94444 6.88889 3.5 7.22222 3.16667 7.66667L1.5 9.66667C0.944444 10.3333 0.666667 11.1667 0.666667 12C0.666667 12.8333 0.944444 13.6667 1.5 14.3333C2.05556 15 2.83333 15.3889 3.66667 15.3889C4.5 15.3889 5.27778 15 5.83333 14.3333L6.72222 13.2778"
                          stroke="#666"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events">
                <p>No events found. Create your first event to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default EventsPage

