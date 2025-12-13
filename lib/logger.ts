// Simple logging utility for API calls
export function logApiCall(
  url: string, 
  method: string, 
  duration: number, 
  status?: number
) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${method} ${url} - ${duration}ms${status ? ` - ${status}` : ''}`
  
  if (process.env.NODE_ENV === 'development') {
    console.log(logMessage)
  }
  
  // In production, you might want to send this to a logging service
  // For now, we'll just use console.log
}

// Additional logging functions for future use
export function logError(message: string, error?: any) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ERROR: ${message}`
  
  if (error) {
    console.error(logMessage, error)
  } else {
    console.error(logMessage)
  }
}

export function logInfo(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] INFO: ${message}`
  
  if (data) {
    console.log(logMessage, data)
  } else {
    console.log(logMessage)
  }
}

