"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { Search, UserPlus, CheckCircle, X } from "lucide-react"

interface User {
  id: string
  username: string
  name: string
  email: string
  image?: string
}

interface UserSearchProps {
  onUserSelect: (user: User) => void
  excludeUsers?: string[] // Array of user IDs to exclude
  placeholder?: string
  currentUserId?: string // ID user yang sedang login
}

export function UserSearch({ onUserSelect, excludeUsers = [], placeholder = "Search username...", currentUserId }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState("")

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length < 4) {
        setSearchResults([])
        setIsSearching(false)
        setHasSearched(false)
        return
      }

      setIsSearching(true)
      setError("")
      setHasSearched(true)

      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(term)}`)
        if (response.ok) {
          const data = await response.json()
          // Filter out excluded users and current user
          const filteredResults = data.users.filter((user: User) => 
            !excludeUsers.includes(user.id) && 
            (!currentUserId || user.id !== currentUserId)
          )
          setSearchResults(filteredResults)
        } else {
          setError("Failed to search users")
        }
      } catch (err) {
        setError("An error occurred while searching")
      } finally {
        setIsSearching(false)
      }
    }, 200), // Kurangi delay dari 300ms ke 200ms untuk responsivitas lebih baik
    [excludeUsers, currentUserId]
  )

  // Effect untuk trigger search saat searchTerm berubah
  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleUserSelect = (user: User) => {
    // Cek apakah user mencoba memilih akun mereka sendiri
    if (currentUserId && user.id === currentUserId) {
      setError("Anda tidak bisa menambahkan akun Anda sendiri ke dalam project")
      return
    }
    
    console.log('UserSearch: handleUserSelect called with user:', user)
    onUserSelect(user)
    setSearchTerm("")
    setSearchResults([])
    setError("")
    setHasSearched(false)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setError("")
    setHasSearched(false)
  }

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[8px] focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
            minLength={4}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            {searchTerm && (
                              <button
                  type="button"
                  onClick={clearSearch}
                  className="p-1 mr-2 text-gray-400 hover:text-gray-600 rounded-[8px]"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
            )}
            {isSearching && (
              <div className="mr-2">
                <div className="w-4 h-4 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700">
              Search Results ({searchResults.length})
            </h4>
          </div>
          <div className="divide-y divide-gray-200">
            {searchResults.map((user) => {
              const isCurrentUser = currentUserId && user.id === currentUserId
              const isExcluded = excludeUsers.includes(user.id)
              
              return (
                <div
                  key={user.id}
                  className={`p-3 hover:bg-gray-50 flex items-center justify-between ${
                    isCurrentUser || isExcluded ? 'opacity-50' : ''
                  }`}
                >
                  <div 
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => !isCurrentUser && !isExcluded && handleUserSelect(user)}
                  >
                                      <Avatar 
                    src={user.image} 
                    alt={user.name || user.username}
                    fallback={user.username}
                    size="sm"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    clickable={true}
                    onClick={() => window.open('/dashboard/settings', '_blank')}
                  />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        @{user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.name || user.email}
                      </p>
                      {isCurrentUser && (
                        <p className="text-xs text-amber-600 font-medium">
                          ⚠️ Your own account
                        </p>
                      )}
                      {isExcluded && (
                        <p className="text-xs text-red-600 font-medium">
                          ❌ Already in project
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCurrentUser ? (
                      <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                        Not Available
                      </span>
                    ) : isExcluded ? (
                      <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                        Already a Member
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#166534] border-[#16A34A] hover:bg-[#DEFAD9] rounded-[8px]"
                        aria-label={`Select user ${user.username}`}
                        title={`Select user ${user.username}`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Button clicked for user:', user.username)
                          handleUserSelect(user)
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Select
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* No Results - Username not found */}
      {searchTerm.length >= 4 && hasSearched && !isSearching && searchResults.length === 0 && !error && (
        <div className="text-center py-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-medium">❌ Username not found</p>
          <p className="text-sm">Make sure the username is correct and registered</p>
        </div>
      )}

    </div>
  )
}
