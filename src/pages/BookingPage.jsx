"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../components/DashboardLayout"
import { bookingService, eventService } from "../services/api"
import { useToast } from "../context/ToastContext"
import "./BookingPage.css"

const BookingPage = () => {
  const [activeTab, setActiveTab] = useState("pending")
  const [showParticipants, setShowParticipants] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [bookings, setBookings] = useState([])
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    // Load events directly and convert them to bookings
    loadEventsAsBookings()
  }, [])

  const loadEventsAsBookings = async () => {
    try {
      setLoading(true)
      console.log("Loading events as bookings...")

      // Get events first to ensure we have the latest data
      const eventsResponse = await eventService.getEvents()
      const events = eventsResponse.data.data || []

      console.log("Events loaded:", events)

      // Then try to get bookings from API
      let existingBookings = []
      try {
        const bookingsResponse = await bookingService.getBookings()
        if (bookingsResponse.data.data && bookingsResponse.data.data.length > 0) {
          console.log("Found bookings in API:", bookingsResponse.data.data)
          existingBookings = bookingsResponse.data.data
        }
      } catch (error) {
        console.log("Error fetching bookings:", error)
      }

      // Create a map of event IDs to existing bookings
      const bookingMap = {}
      existingBookings.forEach((booking) => {
        if (booking.event) {
          bookingMap[booking.event] = booking
        }
      })

      // Create or update bookings for each event
      const updatedBookings = []
      const defaultParticipants = [
        { id: 1, name: "Akbar Husain", selected: true, avatar: "/images/avatar1.png" },
        { id: 2, name: "Aneesh Menon", selected: false, avatar: "/images/avatar2.png" },
      ]

      for (const event of events) {
        // Check if we already have a booking for this event
        if (bookingMap[event._id]) {
          // Update existing booking if needed
          const existingBooking = bookingMap[event._id]

          // Check if the booking needs to be updated (e.g., if event details changed)
          if (
            existingBooking.title !== event.topic ||
            existingBooking.date !== event.date ||
            existingBooking.startTime !== event.startTime ||
            existingBooking.endTime !== event.endTime
          ) {
            // Update the booking
            try {
              const updatedBooking = {
                ...existingBooking,
                title: event.topic || "Untitled Event",
                date: event.date || new Date().toLocaleDateString(),
                startTime: event.startTime || "9:00 AM",
                endTime: event.endTime || "10:00 AM",
              }

              await bookingService.updateBookingStatus(existingBooking._id, updatedBooking)
              updatedBookings.push(updatedBooking)
            } catch (error) {
              console.error("Error updating booking:", error)
              updatedBookings.push(existingBooking)
            }
          } else {
            // No update needed
            updatedBookings.push(existingBooking)
          }
        } else {
          // Create a new booking for this event
          const newBooking = {
            id: `booking-${event._id}`,
            title: event.topic || "Untitled Event",
            date: event.date || new Date().toLocaleDateString(),
            startTime: event.startTime || "9:00 AM",
            endTime: event.endTime || "10:00 AM",
            participants: "John Doe, Jane Smith",
            status: "Pending",
            attendees: 2,
            tab: "pending",
            participantsList: defaultParticipants,
            event: event._id,
            user: event.user,
          }

          try {
            const response = await bookingService.createBooking({
              title: newBooking.title,
              date: newBooking.date,
              startTime: newBooking.startTime,
              endTime: newBooking.endTime,
              participants: newBooking.participants,
              status: newBooking.status,
              attendees: newBooking.attendees,
              participantsList: newBooking.participantsList,
              event: newBooking.event,
              user: newBooking.user,
            })

            // Add the created booking with its API-assigned ID
            updatedBookings.push(response.data.data)
          } catch (error) {
            console.error("Error creating booking:", error)
            // Still add the booking to the local state even if API save fails
            updatedBookings.push(newBooking)
          }
        }
      }

      console.log("Final bookings list:", updatedBookings)
      setBookings(updatedBookings)
      addToast("Bookings synchronized with events", "success")
    } catch (error) {
      console.error("Error loading events as bookings:", error)
      addToast("Failed to load bookings", "error")
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "upcoming") return booking.status === "Accepted"
    if (activeTab === "pending") return booking.status === "Pending"
    if (activeTab === "canceled") return booking.status === "Rejected"
    if (activeTab === "past") {
      // Check if the date is in the past
      try {
        const bookingDate = new Date(booking.date)
        const today = new Date()
        return bookingDate < today
      } catch (error) {
        return false
      }
    }
    return true
  })

  const handleParticipantClick = (booking) => {
    setSelectedBooking(booking)

    // Set participants from the booking or use default if none
    if (booking.participantsList && booking.participantsList.length > 0) {
      setParticipants(booking.participantsList)
    } else {
      // Default participants if none in the booking
      setParticipants([
        { id: 1, name: "Akbar Husain", selected: true, avatar: "/images/avatar1.png" },
        { id: 2, name: "Aneesh Menon", selected: false, avatar: "/images/avatar2.png" },
        { id: 3, name: "Rahul Saini", selected: false, avatar: "/images/avatar3.png" },
        { id: 4, name: "Bharat Thakur", selected: false, avatar: "/images/avatar4.png" },
        { id: 5, name: "Natalia", selected: false, avatar: "/images/avatar5.png" },
        { id: 6, name: "Alia Toy", selected: false, avatar: "/images/avatar6.png" },
      ])
    }

    setShowParticipants(true)
  }

  const toggleParticipant = (participantId) => {
    setParticipants(participants.map((p) => (p.id === participantId ? { ...p, selected: !p.selected } : p)))
  }

  const handleAccept = async () => {
    try {
      if (!selectedBooking) return

      // Update booking status to Accepted
      try {
        await bookingService.updateBookingStatus(selectedBooking._id || selectedBooking.id, {
          status: "Accepted",
          participantsList: participants,
        })
      } catch (error) {
        console.error("API error when accepting booking:", error)
        // Continue with local state update even if API fails
      }

      // Update local state
      setBookings(
        bookings.map((booking) =>
          (booking._id || booking.id) === (selectedBooking._id || selectedBooking.id)
            ? { ...booking, status: "Accepted", tab: "upcoming", participantsList: participants }
            : booking,
        ),
      )

      addToast("Booking accepted successfully", "success")
      setShowParticipants(false)
    } catch (error) {
      console.error("Error accepting booking:", error)
      addToast("Failed to accept booking", "error")
    }
  }

  const handleReject = async () => {
    try {
      if (!selectedBooking) return

      // Update booking status to Rejected
      try {
        await bookingService.updateBookingStatus(selectedBooking._id || selectedBooking.id, {
          status: "Rejected",
          participantsList: participants,
        })
      } catch (error) {
        console.error("API error when rejecting booking:", error)
        // Continue with local state update even if API fails
      }

      // Update local state
      setBookings(
        bookings.map((booking) =>
          (booking._id || booking.id) === (selectedBooking._id || selectedBooking.id)
            ? { ...booking, status: "Rejected", tab: "canceled" }
            : booking,
        ),
      )

      addToast("Booking rejected successfully", "success")
      setShowParticipants(false)
    } catch (error) {
      console.error("Error rejecting booking:", error)
      addToast("Failed to reject booking", "error")
    }
  }

  const refreshBookings = () => {
    loadEventsAsBookings()
    addToast("Refreshing bookings...", "info")
  }

  return (
    <DashboardLayout>
      <div className="booking-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Booking</h1>
            <p className="page-description">See upcoming and past events booked through your event type links.</p>
          </div>
          <button onClick={refreshBookings} className="refresh-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.6667 1.33333L8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Refresh
          </button>
        </div>

        <div className="booking-container">
          <div className="booking-tabs">
            <button
              className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`tab-button ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>
            <button
              className={`tab-button ${activeTab === "canceled" ? "active" : ""}`}
              onClick={() => setActiveTab("canceled")}
            >
              Canceled
            </button>
            <button
              className={`tab-button ${activeTab === "past" ? "active" : ""}`}
              onClick={() => setActiveTab("past")}
            >
              Past
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading bookings...</p>
            </div>
          ) : (
            <div className="bookings-list">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <div key={booking._id || booking.id} className="booking-item">
                    <div className="booking-details">
                      <div className="booking-date-time">
                        <p className="booking-date">{booking.date}</p>
                        <p className="booking-time">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>

                      <div className="booking-info">
                        <h3 className="booking-title">{booking.title}</h3>
                        <p className="booking-participants">{booking.participants}</p>
                      </div>
                    </div>

                    <div className="booking-status">
                      {booking.status === "Pending" ? (
                        <div className="booking-actions">
                          <button className="reject-button" onClick={() => handleParticipantClick(booking)}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 4L4 12M4 4L12 12"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Reject
                          </button>
                          <button className="accept-button" onClick={() => handleParticipantClick(booking)}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13.3334 4L6.00008 11.3333L2.66675 8"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Accept
                          </button>
                        </div>
                      ) : (
                        <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                      )}

                      <div className="attendees">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z"
                            fill="#666"
                          />
                        </svg>
                        <span>{booking.attendees} people</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-bookings">
                  <p>No {activeTab} bookings found.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {showParticipants && (
          <div className="participants-overlay">
            <div className="participants-panel">
              <div className="participants-header">
                <h3>
                  Participant <span className="participant-count">({participants.length})</span>
                </h3>
                <div className="participant-actions">
                  <button className="reject-button" onClick={handleReject}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Reject
                  </button>
                  <button className="accept-button" onClick={handleAccept}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M13.3334 4L6.00008 11.3333L2.66675 8"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Accept
                  </button>
                </div>
              </div>

              <div className="participants-list">
                {participants.map((participant) => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-info">
                      <div className="participant-avatar">
                        <img src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                      </div>
                      <span className="participant-name">{participant.name}</span>
                    </div>
                    <label className="participant-checkbox">
                      <input
                        type="checkbox"
                        checked={participant.selected}
                        onChange={() => toggleParticipant(participant.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default BookingPage

