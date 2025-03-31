"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../components/DashboardLayout"
import { availabilityService, eventService } from "../services/api"
import "./AvailabilityPage.css"

const AvailabilityPage = () => {
  const [activeView, setActiveView] = useState("calendar")
  const [activeTimeRange, setActiveTimeRange] = useState("week")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [events, setEvents] = useState([])
  const [eventTypes, setEventTypes] = useState([])
  const [selectedEventType, setSelectedEventType] = useState("all")
  const [timezone, setTimezone] = useState("(UTC +5:00 Delhi)")
  const [weeklyHours, setWeeklyHours] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const hours = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"]
  const timezones = [
    "(UTC +5:00 Delhi)",
    "(UTC +0:00 London)",
    "(UTC -5:00 New York)",
    "(UTC -8:00 Los Angeles)",
    "(UTC +8:00 Singapore)",
    "(UTC +9:00 Tokyo)",
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch availability data
      const availabilityResponse = await availabilityService.getAvailability()
      if (availabilityResponse.data.data && availabilityResponse.data.data.weeklyHours) {
        setWeeklyHours(availabilityResponse.data.data.weeklyHours)
      } else {
        // Default weekly hours if none found
        setWeeklyHours([
          { day: "Sun", available: false, timeSlots: [] },
          { day: "Mon", available: true, timeSlots: [{ start: "9:00 AM", end: "5:00 PM" }] },
          { day: "Tue", available: true, timeSlots: [{ start: "9:00 AM", end: "5:00 PM" }] },
          { day: "Wed", available: true, timeSlots: [{ start: "9:00 AM", end: "5:00 PM" }] },
          { day: "Thu", available: true, timeSlots: [{ start: "9:00 AM", end: "5:00 PM" }] },
          { day: "Fri", available: true, timeSlots: [{ start: "9:00 AM", end: "5:00 PM" }] },
          { day: "Sat", available: false, timeSlots: [] },
        ])
      }

      // Fetch events for calendar
      const eventsResponse = await eventService.getEvents()
      const fetchedEvents = eventsResponse.data.data || []

      // Format events for calendar display
      const formattedEvents = fetchedEvents.map((event) => {
        const eventDate = new Date(event.date)
        return {
          id: event._id,
          title: event.topic,
          day: days[eventDate.getDay()],
          date: eventDate.getDate(),
          startTime: event.startTime,
          endTime: event.endTime,
          color: event.backgroundColor || "#e6f4ff",
          type: event.meetingType,
        }
      })

      setEvents(formattedEvents)

      // Extract unique event types for filter
      const types = [...new Set(fetchedEvents.map((event) => event.meetingType))]
      setEventTypes(types)
    } catch (error) {
      console.error("Error fetching data:", error)
      showNotification("Failed to load availability data", "error")
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const getDaysInWeek = () => {
    const days = []
    const currentDate = new Date(selectedDate)
    const day = currentDate.getDay()

    // Get the first day of the week (Sunday)
    currentDate.setDate(currentDate.getDate() - day)

    // Get all days in the week
    for (let i = 0; i < 7; i++) {
      days.push({
        day: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][i],
        date: new Date(currentDate).getDate(),
        month: new Date(currentDate).getMonth(),
        year: new Date(currentDate).getFullYear(),
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const weekDays = getDaysInWeek()

  const addTimeSlot = (dayIndex) => {
    const updatedHours = [...weeklyHours]
    updatedHours[dayIndex].timeSlots.push({ start: "9:00 AM", end: "5:00 PM" })
    setWeeklyHours(updatedHours)
    saveAvailability(updatedHours)
  }

  const removeTimeSlot = (dayIndex, slotIndex) => {
    const updatedHours = [...weeklyHours]
    updatedHours[dayIndex].timeSlots.splice(slotIndex, 1)
    setWeeklyHours(updatedHours)
    saveAvailability(updatedHours)
  }

  const toggleDayAvailability = (dayIndex) => {
    const updatedHours = [...weeklyHours]
    updatedHours[dayIndex].available = !updatedHours[dayIndex].available
    setWeeklyHours(updatedHours)
    saveAvailability(updatedHours)
  }

  const handleTimeChange = (dayIndex, slotIndex, field, value) => {
    const updatedHours = [...weeklyHours]
    updatedHours[dayIndex].timeSlots[slotIndex][field] = value
    setWeeklyHours(updatedHours)
    saveAvailability(updatedHours)
  }

  const saveAvailability = async (updatedHours) => {
    try {
      await availabilityService.updateAvailability({
        weeklyHours: updatedHours,
      })
    } catch (error) {
      console.error("Error saving availability:", error)
      showNotification("Failed to save availability", "error")
    }
  }

  const copyTimeSlots = (dayIndex) => {
    const sourceDay = weeklyHours[dayIndex]

    // Show notification to select which days to copy to
    showNotification("Select days to copy this schedule to", "info")

    // In a real implementation, you would show a modal here
    // For now, we'll just copy to all other days
    const updatedHours = weeklyHours.map((day, idx) => {
      if (idx !== dayIndex && day.available) {
        return {
          ...day,
          timeSlots: [...sourceDay.timeSlots],
        }
      }
      return day
    })

    setWeeklyHours(updatedHours)
    saveAvailability(updatedHours)
    showNotification("Schedule copied to other days", "success")
  }

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 7)
    setSelectedDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 7)
    setSelectedDate(newDate)
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  const filteredEvents = events.filter((event) => {
    // Filter by event type
    if (selectedEventType !== "all" && event.type !== selectedEventType) {
      return false
    }

    // Filter by search query
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    return true
  })

  return (
    <DashboardLayout>
      <div className="availability-page">
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
            <h1 className="page-title">Availability</h1>
            <p className="page-description">Configure times when you are available for bookings</p>
          </div>
        </div>

        <div className="view-toggle">
          <button
            className={`view-button ${activeView === "availability" ? "active" : ""}`}
            onClick={() => setActiveView("availability")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2 4H14M2 8H14M2 12H14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Availability
          </button>
          <button
            className={`view-button ${activeView === "calendar" ? "active" : ""}`}
            onClick={() => setActiveView("calendar")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="2"
                y="3"
                width="12"
                height="10"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 2V4M5 2V4M2 6H14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Calendar View
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading availability data...</p>
          </div>
        ) : activeView === "calendar" ? (
          <div className="calendar-container">
            <div className="calendar-header">
              <div className="calendar-filters">
                <div className="filter-group">
                  <label>Activity</label>
                  <div className="select-wrapper">
                    <select
                      className="filter-select"
                      value={selectedEventType}
                      onChange={(e) => setSelectedEventType(e.target.value)}
                    >
                      <option value="all">All Event Types</option>
                      {eventTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type === "google_meet"
                            ? "Google Meet"
                            : type === "zoom"
                              ? "Zoom"
                              : type === "teams"
                                ? "Microsoft Teams"
                                : type === "in_person"
                                  ? "In Person"
                                  : type}
                        </option>
                      ))}
                    </select>
                    <div className="select-arrow"></div>
                  </div>
                </div>

                <div className="filter-group">
                  <label>Time Zone</label>
                  <div className="select-wrapper">
                    <select className="filter-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                      {timezones.map((tz, index) => (
                        <option key={index} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                    <div className="select-arrow"></div>
                  </div>
                </div>
              </div>

              <div className="calendar-navigation">
                <button className="nav-button" onClick={handlePrevWeek}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10 12L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <span className="nav-label" onClick={handleToday}>
                  Today
                </span>
                <button className="nav-button" onClick={handleNextWeek}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="time-range-buttons">
                  <button
                    className={`time-button ${activeTimeRange === "day" ? "active" : ""}`}
                    onClick={() => setActiveTimeRange("day")}
                  >
                    Day
                  </button>
                  <button
                    className={`time-button ${activeTimeRange === "week" ? "active" : ""}`}
                    onClick={() => setActiveTimeRange("week")}
                  >
                    Week
                  </button>
                  <button
                    className={`time-button ${activeTimeRange === "month" ? "active" : ""}`}
                    onClick={() => setActiveTimeRange("month")}
                  >
                    Month
                  </button>
                  <button
                    className={`time-button ${activeTimeRange === "year" ? "active" : ""}`}
                    onClick={() => setActiveTimeRange("year")}
                  >
                    Year
                  </button>
                </div>

                <div className="search-box">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                      stroke="#666"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 14L11.1 11.1"
                      stroke="#666"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search"
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="calendar-grid">
              <div className="time-column">
                <div className="day-header timezone">
                  <span>{timezone.split(" ")[0]}</span>
                  <span>{timezone.split(" ")[1]}</span>
                </div>
                {hours.map((hour, index) => (
                  <div key={index} className="time-slot">
                    <span className="time-label">{hour}</span>
                  </div>
                ))}
              </div>

              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="day-column">
                  <div className="day-header">
                    <div className="day-name">{day.day}</div>
                    <div className="day-number">{day.date}</div>
                  </div>

                  <div className="day-events">
                    {hours.map((hour, hourIndex) => (
                      <div key={hourIndex} className="hour-cell">
                        {filteredEvents
                          .filter(
                            (event) =>
                              event.day === day.day &&
                              event.date === day.date &&
                              hourIndex ===
                                hours.indexOf(
                                  event.startTime.split(":")[0] + " " + event.startTime.split(" ")[1]?.toUpperCase() ||
                                    "AM",
                                ),
                          )
                          .map((event) => {
                            // Calculate event duration in hours
                            const startHour = hours.indexOf(
                              event.startTime.split(":")[0] + " " + event.startTime.split(" ")[1]?.toUpperCase() ||
                                "AM",
                            )
                            const endHour = hours.indexOf(
                              event.endTime.split(":")[0] + " " + event.endTime.split(" ")[1]?.toUpperCase() || "AM",
                            )
                            const duration = endHour - startHour > 0 ? endHour - startHour : 1

                            return (
                              <div
                                key={event.id}
                                className="event-item"
                                style={{
                                  backgroundColor: event.color,
                                  height: `${duration * 60}px`,
                                }}
                              >
                                <div className="event-time">{event.startTime}</div>
                                <div className="event-title">{event.title}</div>
                              </div>
                            )
                          })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="weekly-hours-container">
            <div className="weekly-hours-header">
              <div className="filter-group">
                <label>Activity</label>
                <div className="select-wrapper">
                  <select
                    className="filter-select"
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                  >
                    <option value="all">Event type</option>
                    {eventTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type === "google_meet"
                          ? "Google Meet"
                          : type === "zoom"
                            ? "Zoom"
                            : type === "teams"
                              ? "Microsoft Teams"
                              : type === "in_person"
                                ? "In Person"
                                : type}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow"></div>
                </div>
              </div>

              <div className="filter-group">
                <label>Time Zone</label>
                <div className="select-wrapper">
                  <select className="filter-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    {timezones.map((tz, index) => (
                      <option key={index} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow"></div>
                </div>
              </div>
            </div>

            <h3 className="weekly-hours-title">Weekly hours</h3>

            <div className="weekly-hours-list">
              {weeklyHours.map((day, dayIndex) => (
                <div key={dayIndex} className="day-row">
                  <div className="day-checkbox">
                    <label className="checkbox-container">
                      <input type="checkbox" checked={day.available} onChange={() => toggleDayAvailability(dayIndex)} />
                      <span className="checkmark"></span>
                    </label>
                    <span className="day-name">{day.day}</span>
                  </div>

                  {day.available ? (
                    <div className="time-slots">
                      {day.timeSlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="time-slot-row">
                          <div className="time-inputs">
                            <input
                              type="text"
                              className="time-input"
                              value={slot.start}
                              onChange={(e) => handleTimeChange(dayIndex, slotIndex, "start", e.target.value)}
                              placeholder="9:00 AM"
                            />
                            <span className="time-separator">-</span>
                            <input
                              type="text"
                              className="time-input"
                              value={slot.end}
                              onChange={(e) => handleTimeChange(dayIndex, slotIndex, "end", e.target.value)}
                              placeholder="5:00 PM"
                            />
                          </div>

                          <button className="remove-slot-button" onClick={() => removeTimeSlot(dayIndex, slotIndex)}>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9 3L3 9M3 3L9 9"
                                stroke="#666"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}

                      <div className="slot-actions">
                        <button className="add-slot-button" onClick={() => addTimeSlot(dayIndex)}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 2V10M2 6H10"
                              stroke="#666"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        <button className="copy-slots-button" onClick={() => copyTimeSlots(dayIndex)}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect x="2" y="2" width="6" height="6" rx="1" stroke="#666" strokeWidth="1.5" />
                            <path d="M4 4H8V8H4V4Z" fill="#666" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="unavailable-message">Unavailable</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AvailabilityPage

