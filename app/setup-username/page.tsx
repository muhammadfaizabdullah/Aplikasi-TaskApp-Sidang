"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { User, CheckCircle, AlertCircle } from "lucide-react"

export default function SetupUsernamePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Check username availability
  const checkUsername = async (value: string) => {
    if (value.length < 4) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    try {
      const response = await fetch(`/api/users/check-username?username=${value}`)
      const data = await response.json()
      setIsAvailable(data.available)
      setError("")
    } catch (err) {
      setIsAvailable(null)
    } finally {
      setIsChecking(false)
    }
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    setError("")
    
    // Debounce username check
    const timeoutId = setTimeout(() => {
      checkUsername(value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setError("Username cannot be empty")
      return
    }

    if (username.length < 4 || username.length > 16) {
      setError("Username must be 4-16 characters long")
      return
    }

    if (!isAvailable) {
      setError("Username is already taken")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/users/setup-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim() }),
      })

      if (response.ok) {
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || "Gagal menyimpan username")
      }
    } catch (err) {
      setError("An error occurred, please try again")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Setup Username
              </h2>
              <p className="text-gray-600 text-sm">
                Create a username for your account
              </p>
            </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <label htmlFor="username" className="block text-base font-semibold text-gray-900">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-base">@</span>
                        </div>
                        <input
                          id="username"
                          name="username"
                          type="text"
                          required
                          value={username}
                          onChange={(e) => handleUsernameChange(e.target.value)}
                          className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 text-gray-900 placeholder-gray-400 text-base font-medium bg-gray-50 hover:bg-white hover:border-gray-300"
                          placeholder="username_anda"
                          minLength={4}
                          maxLength={16}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {isChecking && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                          )}
                          {!isChecking && isAvailable === true && (
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </div>
                          )}
                          {!isChecking && isAvailable === false && (
                            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                              <AlertCircle className="h-3 w-3 text-red-600" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Username status */}
                      {username.length >= 4 && !isChecking && (
                        <div className="mt-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                          {isAvailable === true && (
                            <p className="text-xs text-green-700 flex items-center font-medium">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              Username available
                            </p>
                          )}
                          {isAvailable === false && (
                            <p className="text-xs text-red-700 flex items-center font-medium">
                              <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                              Username already taken
                            </p>
                          )}
                        </div>
                      )}

                      {/* Error message */}
                      {error && (
                        <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200">
                          <p className="text-xs text-red-700 flex items-center font-medium">
                            <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                            {error}
                          </p>
                        </div>
                      )}

                      {/* Username rules */}
                      <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <h4 className="text-xs font-semibold text-indigo-800 mb-2">Username Rules:</h4>
                        <div className="text-xs text-indigo-700 space-y-1">
                          <p className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                            4-16 characters, letters/numbers/underscore
                          </p>
                          <p className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                            Username is unique and cannot be changed
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting || !username.trim() || !isAvailable}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] disabled:transform-none"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <User className="w-4 h-4 mr-2" />
                            <span>Save Username</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Compact Info */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <p className="text-xs text-green-700">
                        Username is used for search and collaboration in projects
                      </p>
                    </div>
                  </div>
                </div>
              </div>
      </div>
    </div>
  )
}

