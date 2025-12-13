"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { useTheme } from "@/components/providers/ThemeProvider"
import { User, Mail, Shield, Bell, Palette, Globe, Save, Edit, Camera, X, AlertTriangle, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface UserProfile {
  id: string
  username: string
  name?: string
  email: string
  image?: string
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const { theme: currentTheme, setTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    username: ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState('id')
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1)

  // Initialize profile from session data first, then fetch if needed
  useEffect(() => {
    if (session?.user) {
      const sessionProfile: UserProfile = {
        id: session.user.id || "",
        username: (session.user as any).username || "",
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || ""
      }
      
      // Debug logging for profile photos issue
      console.log('Settings page - Session profile:', {
        id: sessionProfile.id,
        username: sessionProfile.username,
        name: sessionProfile.name,
        email: sessionProfile.email,
        image: sessionProfile.image ? sessionProfile.image.substring(0, 50) + '...' : 'No image'
      })
      
      setProfile(sessionProfile)
      setFormData({
        name: session.user.name || "",
        username: (session.user as any).username || ""
      })
      
      // Only fetch from API if we don't have complete data
      if (!(session.user as any).username || !session.user.name) {
        fetchProfile()
      }
    }
  }, [session])

  const fetchProfile = async () => {
    if (!session?.user?.email) return
    
    try {
      setIsLoading(true)
      setError("")
      
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setFormData({
          name: data.user.name || "",
          username: data.user.username || ""
        })
      } else {
        setError(t('failed_load_profile'))
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(t('error_loading_profile'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 512 * 1024) { // 512KB limit
        setError(t('file_size_too_large'))
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setError(t('file_must_be_image'))
        return
      }
      
      setSelectedFile(file)
      setError("")
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadImage = async () => {
    if (!selectedFile || !imagePreview) return
    
    setIsUploadingImage(true)
    setError("")
    
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      
      const uploadResponse = await fetch('/api/users/me/avatar', {
        method: 'POST',
        body: formData
      })
      
      if (uploadResponse.ok) {
        const data = await uploadResponse.json()
        setSuccess(t('profile_photo_updated_successfully'))
        setImagePreview(null)
        setSelectedFile(null)
        
        // Update local profile state with new image
        if (profile) {
          const updatedProfile = { ...profile, image: data.user.image }
          setProfile(updatedProfile)
        }
        
        // Force session refresh to update all components
        await updateSession()
        
        // Additional refresh after a short delay to ensure all components update
        setTimeout(async () => {
          await updateSession()
          // Log successful update
          console.log('Profile photo updated, session refreshed')
        }, 500)
      } else {
        const data = await uploadResponse.json()
        setError(data.error || t('failed_upload_profile_photo'))
      }
    } catch (error) {
      setError(t('error_uploading_photo'))
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeImagePreview = () => {
    setImagePreview(null)
    setSelectedFile(null)
    setError("")
  }

  const handleThemeChange = (theme: string) => {
    setTheme(theme as 'green' | 'blue' | 'purple')
    setShowThemeModal(false)
    setSuccess(t('theme changed successfully'))
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language)
    // Save to localStorage
    localStorage.setItem('language', language)
    // update global language provider
    if (language === 'id' || language === 'en') setLang(language as 'id' | 'en')
    setShowLanguageModal(false)
    setSuccess(t('language changed successfully'))
    setTimeout(() => setSuccess(''), 3000)
  }

  // Load saved preferences on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en'
    setCurrentLanguage(savedLanguage)
  }, [])

  // Debug effect to log avatar data
  useEffect(() => {
    if (profile || session?.user) {
      console.log('Avatar data debug:', {
        profileImage: profile?.image ? profile.image.substring(0, 50) + '...' : 'No profile image',
        sessionImage: session?.user?.image ? session.user.image.substring(0, 50) + '...' : 'No session image',
        profileName: profile?.name,
        profileUsername: profile?.username,
        sessionName: session?.user?.name,
        sessionUsername: (session?.user as any)?.username
      })
    }
  }, [profile, session])

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.username.trim()) {
      setError(t('name_username_required'))
      return
    }

    if (formData.username.length < 4 || formData.username.length > 16) {
      setError(t('username_length_requirement'))
      return
    }

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(t('profile_updated_successfully'))
        setIsEditing(false)
        
        // Update local profile state
        setProfile(data.user)
        
        // Update session
        await updateSession()
        
      } else {
        const data = await response.json()
        setError(data.error || t('failed_update_profile'))
      }
    } catch (error) {
      setError(t('error_saving_profile'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch('/api/users/me', {
        method: 'DELETE'
      })

      if (response.ok) {
        // Redirect to home or logout
        window.location.href = '/'
      } else {
        const data = await response.json()
        setError(data.error || t('failed_delete_account'))
      }
    } catch (error) {
      setError(t('error_deleting_account'))
    } finally {
      setIsLoading(false)
      setShowDeleteModal(false)
    }
  }

  // Show loading only when actually fetching data
  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-200 border-t-transparent loading-spinner"></div>
      </div>
    )
  }

  // Show error if no profile and no session
  if (!profile && !session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t('cannot load profile')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 capitalize">
      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('settings')}</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">{t('settings subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Profile Settings - Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white rounded-[8px] sm:rounded-[8px] shadow-lg border card-themed p-4 sm:p-6 lg:p-8 min-h-[450px] pb-20">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">{t('profile information')}</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[8px]">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-[8px]">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <div className="space-y-4 sm:space-y-6">
                {/* Profile Photo Section */}
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <Avatar 
                      src={imagePreview || profile?.image || session?.user?.image} 
                      alt={profile?.name || profile?.username || session?.user?.name || undefined}
                      fallback={profile?.username || profile?.name || session?.user?.name || 'User'}
                      size="xl"
                      className="w-20 h-20 sm:w-24 sm:h-24"
                    />
                                         {imagePreview && (
                       <div className="absolute -top-2 -right-2">
                         <button
                           onClick={removeImagePreview}
                           className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                           title={t('remove image preview')}
                           aria-label={t('remove image preview')}
                         >
                           <X className="w-3 h-3 sm:w-4 sm:h-4" />
                         </button>
                       </div>
                     )}
                  </div>
                  
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile photo')}
                    </label>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="profile-image"
                        />
                        <label
                          htmlFor="profile-image"
                          className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-[8px] cursor-pointer hover:bg-green-700 transition-colors text-sm sm:text-base"
                        >
                          {t('choose file')}
                        </label>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {selectedFile ? selectedFile.name : t('no file chosen')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {t('formats hint')}
                      </p>
                      
                      {imagePreview && (
                        <Button
                          onClick={handleUploadImage}
                          disabled={isUploadingImage}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 rounded-[8px] text-sm sm:text-base"
                        >
                          {isUploadingImage ? (
                            <>
                              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 loading-spinner"></div>
                              {t('uploading')}
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              {t('upload')}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Information Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('full name')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-[8px] focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                        placeholder={t('enter full name')}
                      />
                    ) : (
                      <p className="text-gray-500 py-2 text-sm sm:text-base capitalize">{profile?.name || t('demo user')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-[8px] focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                        placeholder={t('enter_username')}
                        minLength={4}
                        maxLength={16}
                      />
                    ) : (
                      <p className="text-gray-500 py-2 text-sm sm:text-base lowercase">{profile?.username || t('demo user')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-500 py-2 text-sm sm:text-base lowercase">{profile?.email || t('demo email')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('email cannot be changed')}
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-3 sm:pt-4">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-green-600 hover:bg-green-700 rounded-[8px] px-4 sm:px-6 py-2 text-sm sm:text-base capitalize"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      {t('edit profile')}
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 rounded-[8px] px-4 sm:px-6 py-2 text-sm sm:text-base"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 loading-spinner"></div>
                            {t('saving')}
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            {t('save')}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false)
                          setFormData({
                            name: profile?.name || "",
                            username: profile?.username || ""
                          })
                          setError("")
                          setSuccess("")
                        }}
                        variant="outline"
                        className="rounded-[8px] px-4 sm:px-6 py-2 text-sm sm:text-base"
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-[8px] sm:rounded-[8px] shadow-lg border card-themed p-4 sm:p-6 lg:p-8 min-h-[250px]">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('account info')}
              </h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('member since')}:</span>
                  <span className="text-gray-900">
                    {(() => {
                      const d = new Date()
                      const dd = String(d.getDate()).padStart(2, '0')
                      const mm = String(d.getMonth() + 1).padStart(2, '0')
                      const yyyy = d.getFullYear()
                      return `${dd}/${mm}/${yyyy}`
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('status')}:</span>
                  <span className="text-green-600 font-medium">{t('active')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('username')}</span>
                  <span className="text-gray-900 lowercase">@{profile?.username}</span>
                </div>
              </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-[8px] sm:rounded-[8px] shadow-lg border card-themed p-4 sm:p-6 lg:p-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('quick actions')}
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={() => setShowThemeModal(true)}
                  variant="outline"
                  className={"w-full rounded-[8px] px-3 sm:px-4 py-2 border-0 text-white font-medium transition-all duration-300 btn-palette-gradient text-sm sm:text-base capitalize"}
                >
                  <Palette className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {t('change theme')}
                </Button>
                <Button
                  onClick={() => setShowLanguageModal(true)}
                  variant="outline"
                  className={`w-full rounded-[8px] px-3 sm:px-4 py-2 border-0 font-medium transition-all duration-300 ${currentLanguage === 'id' ? 'btn-lang-id' : 'btn-lang-en'} text-sm sm:text-base capitalize`}
                >
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {t('change language')}
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteModal(true)
                    setDeleteStep(1)
                  }}
                  variant="outline"
                  className="w-full rounded-[8px] px-3 sm:px-4 py-2 border-0 font-medium transition-all duration-300 btn-delete-account text-sm sm:text-base capitalize"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {t('delete account')}
                </Button>
              </div>
          </div>
        </div>
      </div>

      {/* Theme Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              {t('choose theme')}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => handleThemeChange('green')}
                className={`w-full p-3 sm:p-4 rounded-[8px] border-2 transition-all duration-200 ${
                  currentTheme === 'green' 
                    ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full theme-indicator-green"></div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">{t('green theme')}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{t('default green theme')}</div>
                    </div>
                  </div>
                  {currentTheme === 'green' && <span className="text-green-600 text-lg sm:text-xl">✓</span>}
                </div>
              </button>
              
              <button
                onClick={() => handleThemeChange('blue')}
                className={`w-full p-3 sm:p-4 rounded-[8px] border-2 transition-all duration-200 ${
                  currentTheme === 'blue' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full theme-indicator-blue"></div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">{t('blue theme')}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{t('professional blue theme')}</div>
                    </div>
                  </div>
                  {currentTheme === 'blue' && <span className="text-blue-600 text-lg sm:text-xl">✓</span>}
                </div>
              </button>
              
              <button
                onClick={() => handleThemeChange('purple')}
                className={`w-full p-3 sm:p-4 rounded-[8px] border-2 transition-all duration-200 ${
                  currentTheme === 'purple' 
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md' 
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full theme-indicator-purple"></div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">{t('purple theme')}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{t('elegant purple theme')}</div>
                    </div>
                  </div>
                  {currentTheme === 'purple' && <span className="text-purple-600 text-lg sm:text-xl">✓</span>}
                </div>
              </button>
            </div>
            <div className="mt-4 sm:mt-6 flex justify-end">
              <Button
                onClick={() => setShowThemeModal(false)}
                variant="outline"
                className="px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600 text-sm sm:text-base"
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              {t('choose language')}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => handleLanguageChange('id')}
                className={`w-full p-2 sm:p-3 rounded-[8px] border-2 transition-colors ${
                  currentLanguage === 'id' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base">{t('indonesian')}</span>
                  {currentLanguage === 'id' && <span className="text-green-600">✓</span>}
                </div>
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`w-full p-2 sm:p-3 rounded-[8px] border-2 transition-colors ${
                  currentLanguage === 'en' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base">{t('english')}</span>
                  {currentLanguage === 'en' && <span className="text-green-600">✓</span>}
                </div>
              </button>
            </div>
            <div className="mt-4 sm:mt-6 flex justify-end">
              <Button
                onClick={() => setShowLanguageModal(false)}
                variant="outline"
                className="px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600 text-sm sm:text-base"
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-red-600 mb-3 sm:mb-4">
              {t('delete account')}
            </h3>
            <div className="mb-4">
              {deleteStep === 1 && <p className="text-sm sm:text-base">{t('delete_warning_1')}</p>}
              {deleteStep === 2 && <p className="text-sm sm:text-base">{t('delete_warning_2')}</p>}
              {deleteStep === 3 && <p className="text-sm sm:text-base">{t('delete_warning_3')}</p>}
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="px-3 sm:px-4 py-2"
              >
                {t('cancel')}
              </Button>
              {deleteStep < 3 ? (
                <Button
                  onClick={() => setDeleteStep(deleteStep + 1)}
                  className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2"
                >
                  {t('continue')}
                </Button>
              ) : (
                <Button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2"
                >
                  {t('confirm delete')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
