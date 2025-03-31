// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return ""

  try {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Handle different date formats
    let date
    if (dateString.includes("/")) {
      // Handle dd/mm/yyyy or dd/mm/yy format
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

    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateString}, using current date instead`)
      date = new Date()
    }

    const dayName = days[date.getDay()]
    const monthName = months[date.getMonth()]
    const dayNum = date.getDate()

    return `${dayName}, ${dayNum} ${monthName}`
  } catch (error) {
    console.error("Date formatting error:", error)
    // Return a fallback date if there's an error
    const today = new Date()
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]}`
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
  // Ensure date is in the correct format (dd/mm/yy)
  let formattedDate = eventData.date
  if (!formattedDate.includes("/")) {
    const date = new Date(formattedDate)
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = String(date.getFullYear()).slice(-2)
      formattedDate = `${day}/${month}/${year}`
    }
  }

  return {
    topic: eventData.topic || eventData.title,
    date: formattedDate,
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

