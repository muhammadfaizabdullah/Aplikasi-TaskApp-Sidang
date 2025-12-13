'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'green' | 'blue' | 'purple'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('green')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load theme from localStorage after component mounts (prefer landing page key)
    const savedTheme = (localStorage.getItem('taskapp-theme') as Theme) || (localStorage.getItem('theme') as Theme) || 'green'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
    setMounted(true)
  }, [])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    // Persist under both keys for cross-page compatibility
    localStorage.setItem('theme', newTheme)
    localStorage.setItem('taskapp-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

