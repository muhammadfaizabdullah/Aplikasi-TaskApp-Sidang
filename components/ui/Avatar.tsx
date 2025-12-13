"use client"

import { useState } from "react"
import { User } from "lucide-react"

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  onClick?: () => void
  clickable?: boolean
}

export function Avatar({ src, alt, fallback, size = "md", className = "", onClick, clickable = false }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  

  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  }
  
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
    xl: "text-xl"
  }

  // Helper function untuk mendapatkan inisial yang valid
  const getValidInitials = (text: string): string => {
    if (!text || typeof text !== 'string') return 'U'
    
    // Hapus karakter khusus dan ambil hanya huruf
    const cleanText = text.replace(/[^a-zA-Z\s]/g, '').trim()
    if (!cleanText) return 'U'
    
    // Ambil 2 huruf pertama
    const words = cleanText.split(' ').filter(word => word.length > 0)
    if (words.length === 0) return 'U'
    
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase()
    }
    
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }

  // Helper function to validate and clean image src
  const getCleanImageSrc = (imageSrc: string | null | undefined): string | null => {
    if (!imageSrc || typeof imageSrc !== 'string' || imageSrc.trim() === '') {
      return null
    }
    
    // Clean the image source
    const cleanSrc = imageSrc.trim()
    
    // Check if it's a valid URL or base64 data URL
    if (cleanSrc.startsWith('data:image/') || 
        cleanSrc.startsWith('http://') || 
        cleanSrc.startsWith('https://') ||
        cleanSrc.startsWith('/')) {
      return cleanSrc
    }
    
    return null
  }

  // Get clean image source
  const cleanImageSrc = getCleanImageSrc(src)

  // Jika ada gambar dan tidak ada error, tampilkan gambar
  if (cleanImageSrc && !imageError) {
    // Handle base64 images differently (no CORS attributes needed)
    const isBase64 = cleanImageSrc.startsWith('data:image/')
    
    return (
      <img
        src={cleanImageSrc}
        alt={alt || "Profile picture"}
        className={`${sizeClasses[size]} rounded-[8px] object-cover ${className} ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        referrerPolicy={isBase64 ? undefined : "no-referrer"}
        crossOrigin={isBase64 ? undefined : "anonymous"}
        onError={() => {
          console.log('Avatar image failed to load:', cleanImageSrc?.substring(0, 50) + '...')
          setImageError(true)
        }}
        onLoad={() => {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Avatar image loaded successfully:', isBase64 ? 'Base64 image' : cleanImageSrc)
          }
        }}
        onClick={clickable ? onClick : undefined}
      />
    )
  }

  // Jika tidak ada gambar atau error, tampilkan default avatar dengan inisial
  let displayText = 'U'
  
  // Prioritize fallback (username) over alt (name) for better initials
  if (fallback && fallback.trim() && fallback !== 'E-Mail') {
    displayText = getValidInitials(fallback)
  } else if (alt && alt.trim() && alt !== 'E-Mail') {
    displayText = getValidInitials(alt)
  }
  
  return (
    <div 
              className={`${sizeClasses[size]} avatar-dynamic-bg rounded-[8px] flex items-center justify-center ${className} ${clickable ? 'cursor-pointer transition-opacity hover:opacity-90' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <span className={`${textSizes[size]} font-bold text-white tracking-wide`}>
        {displayText}
      </span>
    </div>
  )
}
