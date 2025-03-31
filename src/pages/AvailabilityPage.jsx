"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../components/DashboardLayout"
import { availabilityService, eventService } from "../services/api"
import { useToast } from "../context/ToastContext"
import "./AvailabilityPage.css"

const AvailabilityPage = () => {
  const [activeView, setActiveView] = useState("calendar")
  const [activeTimeRange, setActiveTimeRange] = useState("week")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [eventTypes, setEventTypes] = useState([])
  const [selectedEventType, setSelectedEventType] = useState("all")
  const [timezone, setTimezone] = useState("(UTC +5:00 Delhi)")
  const [weeklyHours, setWeeklyHours] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const { addToast } = useToast()

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

  // Parse date string to Date object
  const parseDate = (dateString) => {
    if (!dateString) return new Date()

    try {
      // Try different date formats
      let date

      // Format: dd/mm/yyyy or dd/mm/yy
      if (dateString.includes("/")) {
        const parts = dateString.split("/")
        if (parts.length === 3) {
          // Handle 2-digit year
          let year = parts[2]
          if (year.length === 2) {
            year = "20" + year
          }
          date = new Date(`${year}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`)
        }
      } else {
        // Try standard date parsing
        date = new Date(dateString)
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date: ${dateString}, using current date instead`)
        return new Date()
      }

      return date
    } catch (error) {
      console.error(`Error parsing date: ${dateString}`, error)
      return new Date()
    }
  }

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true)
      console.log("Fetching availability and events data...")

      // Fetch availability data
      try {
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
      } catch (error) {
        console.error("Error fetching availability:", error)
        // Use default weekly hours
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
      try {
        const eventsResponse = await eventService.getEvents()
        const fetchedEvents = eventsResponse.data.data || []

        console.log("Fetched events for calendar:", fetchedEvents)

        if (fetchedEvents.length === 0) {
          setEvents([])
          setEventTypes([])
          setLoading(false)
          return
        }

        // Format events for calendar display
        const formattedEvents = fetchedEvents.map((event) => {
          // Parse the date
          const eventDate = parseDate(event.date)

          // Format the time for display
          let startTime = event.startTime || "9:00"
          if (!startTime.includes("AM") && !startTime.includes("PM") && event.timeFormat) {
            startTime = `${startTime} ${event.timeFormat}`
          }

          let endTime = event.endTime || "10:00"
          if (!endTime.includes("AM") && !endTime.includes("PM") && event.timeFormat) {
            endTime = `${endTime} ${event.timeFormat}`
          }

          return {
            id: event._id,
            title: event.topic || "Untitled Event",
            day: days[eventDate.getDay()],
            date: eventDate.getDate(),
            month: eventDate.getMonth(),
            year: eventDate.getFullYear(),
            startTime: startTime,
            endTime: endTime,
            color: event.backgroundColor || "#e6f4ff",
            type: event.meetingType || "google_meet",
            rawDate: eventDate,
          }
        })

        console.log("Formatted events for calendar:", formattedEvents)
        setEvents(formattedEvents)

        // Extract unique event types for filter
        const types = [...new Set(fetchedEvents.map((event) => event.meetingType))].filter(Boolean)
        setEventTypes(types)

        addToast("Calendar events loaded successfully", "success")
      } catch (error) {
        console.error("Error fetching events:", error)
        setEvents([])
        setEventTypes([])
        addToast("Failed to load calendar events", "error")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      addToast("Failed to load availability data", "error")
    } finally {
      setLoading(false)
    }
  }

  // Get days in the current week
  const getDaysInWeek = () => {
    const days = []
    const currentDate = new Date(selectedDate)
    const day = currentDate.getDay()

    // Get the first day of the week (Sunday)
    currentDate.setDate(currentDate.getDate() - day)

    // Get all days in the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate)
      days.push({
        day: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][i],
        date: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        fullDate: date,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const weekDays = getDaysInWeek()

  // Weekly hours management functions
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
      addToast("Availability updated successfully", "success")
    } catch (error) {
      console.error("Error saving availability:", error)
      addToast("Failed to save availability", "error")
    }
  }

  const copyTimeSlots = (dayIndex) => {
    const sourceDay = weeklyHours[dayIndex]

    // Show notification to select which days to copy to
    addToast("Select days to copy this schedule to", "info")

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
    addToast("Schedule copied to other days", "success")
  }

  // Calendar navigation functions
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

  // Function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  // Filter events for the current week view
  const filteredEvents = events.filter((event) => {
    // Filter by event type
    if (selectedEventType !== "all" && event.type !== selectedEventType) {
      return false
    }

    // Filter by search query
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // For week view, check if the event is in the current week
    if (activeTimeRange === "week") {
      // Check if the event date is in the current week
      return weekDays.some((day) => isSameDay(day.fullDate, event.rawDate))
    }

    return true
  })

  // Function to get time index for event placement
  const getTimeIndex = (timeString) => {
    if (!timeString) return 0

    try {
      // Extract hour from time string
      let hour
      let ampm

      if (timeString.includes(":")) {
        const parts = timeString.split(":")
        hour = Number.parseInt(parts[0])

        // Check for AM/PM in the second part
        if (parts[1].includes("AM")) {
          ampm = "AM"
        } else if (parts[1].includes("PM")) {
          ampm = "PM"
        }
      } else {
        hour = Number.parseInt(timeString)
      }

      // If AM/PM not found in split, check the whole string
      if (!ampm) {
        if (timeString.includes("AM")) {
          ampm = "AM"
        } else if (timeString.includes("PM")) {
          ampm = "PM"
        } else {
          // Default to AM if no AM/PM specified
          ampm = "AM"
        }
      }

      // Adjust hour for PM
      if (ampm === "PM" && hour < 12) {
        hour += 12
      } else if (ampm === "AM" && hour === 12) {
        hour = 0
      }

      // Map to our hours array
      for (let i = 0; i < hours.length; i++) {
        const hourPart = hours[i].split(" ")[0]
        const ampmPart = hours[i].split(" ")[1]
        let hourValue = Number.parseInt(hourPart)

        if (ampmPart === "PM" && hourValue < 12) {
          hourValue += 12
        } else if (ampmPart === "AM" && hourValue === 12) {
          hourValue = 0
        }

        if (hourValue === hour) {
          return i
        }
      }

      // Default to first hour if not found
      return 0
    } catch (error) {
      console.error("Error parsing time:", timeString, error)
      return 0
    }
  }

  const refreshCalendar = () => {
    fetchData()
    addToast("Refreshing calendar...", "info")
  }

  return (
    <DashboardLayout>
      <div className="availability-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Availability</h1>
            <p className="page-description">Configure times when you are available for bookings</p>
          </div>
          <button onClick={refreshCalendar} className="refresh-button">
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
                          .filter((event) => isSameDay(day.fullDate, event.rawDate))
                          .map((event) => {
                            // Get the hour index for placement
                            const startHourIndex = getTimeIndex(event.startTime)

                            // Only render if this is the starting hour cell
                            if (hourIndex === startHourIndex) {
                              // Calculate duration (default to 1 if can't determine)
                              const endHourIndex = getTimeIndex(event.endTime)
                              const duration = endHourIndex > startHourIndex ? endHourIndex - startHourIndex : 1

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
                            }
                            return null
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

