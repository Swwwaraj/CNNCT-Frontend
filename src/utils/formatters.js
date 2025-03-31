// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return ""

  try {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Handle different date formats
    let date
    if (typeof dateString === "string" && dateString.includes("/")) {
      // Handle dd/mm/yyyy format
      const parts = dateString.split("/")
      if (parts.length === 3) {
        const [day, month, year] = parts
        // Ensure we have a 4-digit year
        const fullYear = year.length === 2 ? `20${year}` : year
        date = new Date(`${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
      } else {
        date = new Date(dateString)
      }
    } else {
      date = new Date(dateString)
    }

    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString)
      return dateString // Return original if parsing fails
    }

    const dayName = days[date.getDay()]
    const monthName = months[date.getMonth()]
    const dayNum = date.getDate()

    return `${dayName}, ${dayNum} ${monthName}`
  } catch (error) {
    console.error("Date formatting error:", error)
    return dateString
  }
}

// Format time for display
export const formatTime = (timeString, timeFormat) => {
  if (!timeString) return ""

  // If timeString already has AM/PM, return as is
  if (timeString.toLowerCase().includes("am") || timeString.toLowerCase().includes("pm")) {
    return timeString
  }

  // Otherwise, append the timeFormat
  return `${timeString} ${timeFormat || ""}`.trim()
}

// Format event data from backend to frontend
export const formatEventFromBackend = (event) => {
  if (!event) return null

  return {
    id: event._id,
    title: event.topic,
    date: formatDate(event.date),
    startTime: formatTime(event.startTime, event.timeFormat),
    endTime: formatTime(event.endTime, event.timeFormat),
    type:
      event.meetingType === "google_meet"
        ? "Google Meet"
        : event.meetingType === "zoom"
          ? "Zoom"
          : event.meetingType === "teams"
            ? "Microsoft Teams"
            : "In Person",
    active: event.active,
    conflict: event.conflict,
    link: event.link,
    backgroundColor: event.backgroundColor || "#0066ff",
    description: event.description,
    emails: event.emails,
    password: event.password,
    timezone: event.timezone,
    duration: event.duration,
    user: event.user,
  }
}

// Format event data from frontend to backend
export const formatEventForBackend = (eventData) => {
  return {
    topic: eventData.topic || eventData.title,
    date: eventData.date,
    startTime: eventData.startTime || eventData.time,
    endTime: eventData.endTime,
    timeFormat: eventData.timeFormat || "AM",
    meetingType: eventData.meetingType || "google_meet",
    backgroundColor: eventData.backgroundColor || "#0066ff",
    description: eventData.description || "",
    link: eventData.link || "",
    emails: eventData.emails || "",
    password: eventData.password || "",
    timezone: eventData.timezone || "(UTC +5:00 Delhi)",
    duration: eventData.duration || "1 hour",
    active: eventData.active !== undefined ? eventData.active : true,
    conflict: eventData.conflict || false,
  }
}

// Calculate end time based on start time and duration
export const calculateEndTime = (startTime, duration, timeFormat) => {
  if (!startTime || !duration) return ""

  try {
    // Parse start time
    let [hours, minutes] = startTime.split(":")
    hours = Number.parseInt(hours)
    minutes = Number.parseInt(minutes || 0)

    // Convert to 24-hour format if PM
    if (timeFormat === "PM" && hours < 12) {
      hours += 12
    } else if (timeFormat === "AM" && hours === 12) {
      hours = 0
    }

    // Parse duration
    let durationHours = 0
    let durationMinutes = 0

    if (duration.includes("hour")) {
      const match = duration.match(/(\d+(\.\d+)?)\s*hour/)
      if (match) {
        const hourValue = Number.parseFloat(match[1])
        durationHours = Math.floor(hourValue)
        durationMinutes = Math.round((hourValue - durationHours) * 60)
      }
    } else if (duration.includes("minute")) {
      const match = duration.match(/(\d+)\s*minute/)
      if (match) {
        durationMinutes = Number.parseInt(match[1])
      }
    }

    // Calculate end time
    let endHours = hours + durationHours
    let endMinutes = minutes + durationMinutes

    if (endMinutes >= 60) {
      endHours += Math.floor(endMinutes / 60)
      endMinutes %= 60
    }

    // Convert back to 12-hour format
    let endTimeFormat = timeFormat
    if (endHours >= 12) {
      endTimeFormat = "PM"
      if (endHours > 12) {
        endHours -= 12
      }
    } else if (endHours === 0) {
      endHours = 12
      endTimeFormat = "AM"
    }

    // Format the end time
    return `${endHours}:${endMinutes.toString().padStart(2, "0")}`
  } catch (error) {
    console.error("End time calculation error:", error)
    return ""
  }
}

// Parse date string to a consistent format
export const parseDateString = (dateString) => {
  if (!dateString) return ""

  try {
    // Handle different date formats
    let date
    if (typeof dateString === "string" && dateString.includes("/")) {
      // Handle dd/mm/yyyy format
      const parts = dateString.split("/")
      if (parts.length === 3) {
        const [day, month, year] = parts
        // Ensure we have a 4-digit year
        const fullYear = year.length === 2 ? `20${year}` : year
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${fullYear}`
      }
    }

    // If it's not in dd/mm/yyyy format, try to convert it
    date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, "0")
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }

    // If all else fails, return the original
    return dateString
  } catch (error) {
    console.error("Date parsing error:", error)
    return dateString
  }
}

