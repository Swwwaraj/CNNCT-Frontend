"use client"

import { useState } from "react"
import DashboardLayout from "../components/DashboardLayout"
import "./BookingPage.css"

const BookingPage = () => {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [showParticipants, setShowParticipants] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  const [bookings, setBookings] = useState([
    {
      id: 1,
      title: "Appointment",
      date: "Friday, 28 feb",
      startTime: "2:35 pm",
      endTime: "3:00 pm",
      participants: "You and Dr.kumar",
      status: "Rejected",
      attendees: 1,
      tab: "canceled",
    },
    {
      id: 2,
      title: "Meeting-2",
      date: "Friday, 28 feb",
      startTime: "1:30 pm",
      endTime: "2:30 pm",
      participants: "You and team 2",
      status: "Accepted",
      attendees: 13,
      tab: "past",
    },
    {
      id: 3,
      title: "Meeting",
      date: "Friday, 28 feb",
      startTime: "10:30 AM",
      endTime: "12:30 pm",
      participants: "You and team 1",
      status: "Pending",
      attendees: 4,
      tab: "pending",
    },
  ])

  const [participants, setParticipants] = useState([
    { id: 1, name: "Akbar Husain", selected: true, avatar: "https://img.freepik.com/premium-photo/bearded-man-illustration_665280-67047.jpg?w=996" },
    { id: 2, name: "Aneesh Menon", selected: false, avatar: "https://img.freepik.com/premium-photo/bearded-man-illustration_665280-67047.jpg?w=996" },
    { id: 3, name: "Rahul Saini", selected: false, avatar: "https://img.freepik.com/premium-photo/bearded-man-illustration_665280-67047.jpg?w=996" },
    { id: 4, name: "Bharat Thakur", selected: false, avatar: "https://img.freepik.com/premium-photo/bearded-man-illustration_665280-67047.jpg?w=996" },
    { id: 5, name: "Natalia", selected: false, avatar: "https://img.freepik.com/premium-photo/bearded-man-illustration_665280-67047.jpg?w=996" },
    { id: 6, name: "Alia Toy", selected: false, avatar: "https://img.freepik.com/premium-photo/bearded-man-illustration_665280-67047.jpg?w=996" },
  ])

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "upcoming") return booking.status === "Pending"
    if (activeTab === "pending") return booking.tab === "pending"
    if (activeTab === "canceled") return booking.tab === "canceled"
    if (activeTab === "past") return booking.tab === "past"
    return true
  })

  const handleParticipantClick = (bookingId) => {
    setSelectedBooking(bookingId)
    setShowParticipants(true)
  }

  const toggleParticipant = (participantId) => {
    setParticipants(participants.map((p) => (p.id === participantId ? { ...p, selected: !p.selected } : p)))
  }

  const handleAccept = () => {
    // In a real app, you would send this to your backend
    console.log(
      "Accepted with participants:",
      participants.filter((p) => p.selected),
    )
    setShowParticipants(false)
  }

  const handleReject = () => {
    // In a real app, you would send this to your backend
    console.log("Rejected booking")
    setShowParticipants(false)
  }

  return (
    <DashboardLayout>
      <div className="booking-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Booking</h1>
            <p className="page-description">See upcoming and past events booked through your event type links.</p>
          </div>
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
              past
            </button>
          </div>

          <div className="bookings-list">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="booking-item">
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
                        <button className="reject-button" onClick={() => handleParticipantClick(booking.id)}>
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
                        <button className="accept-button" onClick={() => handleParticipantClick(booking.id)}>
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

