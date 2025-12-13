import { logApiCall } from './logger'

// API utility functions with retry mechanism and timeout

interface ApiOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
}

const defaultOptions: ApiOptions = {
  timeout: 10000, // 10 seconds
  retries: 2,
  retryDelay: 1000 // 1 second
}

export async function apiCall<T>(
  url: string, 
  options: RequestInit = {}, 
  apiOptions: ApiOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...apiOptions }
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), opts.timeout)
  
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= (opts.retries ?? 0); attempt++) {
    const startTime = Date.now()
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const duration = Date.now() - startTime
      logApiCall(url, options.method || 'GET', duration, response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      const duration = Date.now() - startTime
      logApiCall(url, options.method || 'GET', duration)
      
      lastError = error as Error
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      if (attempt < (opts.retries ?? 0)) {
        console.warn(`API call failed, retrying... (${attempt + 1}/${opts.retries ?? 0})`)
        await new Promise(resolve => setTimeout(resolve, opts.retryDelay ?? 1000))
      }
    }
  }
  
  throw lastError || new Error('Request failed')
}

// Specific API functions
export async function fetchUserData() {
  return apiCall('/api/users/me')
}

export async function fetchProjects() {
  return apiCall('/api/projects')
}

export async function fetchTeamMembers() {
  return apiCall('/api/team')
}

export async function fetchTasks() {
  return apiCall('/api/tasks')
}
