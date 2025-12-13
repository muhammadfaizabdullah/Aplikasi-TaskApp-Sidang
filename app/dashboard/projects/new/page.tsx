"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, Plus, User, AlertCircle } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useToast } from "@/components/ui/Toaster"

interface ProjectForm {
  name: string
  description: string
  status: string
  endDate: string
}

export default function NewProjectPage() {
  const { data: session, status } = useSession()
  const { t } = useLanguage()
  const router = useRouter()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(true)
  const [hasUsername, setHasUsername] = useState(false)
  const [formData, setFormData] = useState<ProjectForm>({
    name: "",
    description: "",
    status: "PLANNING",
    endDate: ""
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Check if user has username set
  useEffect(() => {
    const checkUsername = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/users/me')
          if (response.ok) {
            const userData = await response.json()
            if (userData.user?.username) {
              setHasUsername(true)
            } else {
              setHasUsername(false)
            }
          }
        } catch (error) {
          console.error('Error checking username:', error)
        } finally {
          setCheckingUsername(false)
        }
      }
    }

    if (status === 'authenticated') {
      checkUsername()
    } else if (status === 'loading') {
      setCheckingUsername(true)
    } else {
      setCheckingUsername(false)
    }
  }, [session, status])

  if (status === "loading" || checkingUsername) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  // Show username setup prompt if user doesn't have username
  if (!hasUsername) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-[8px] shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('username_required')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('username_required_desc')}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/setup-username')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-[8px] font-medium"
              >
                <User className="w-4 h-4 mr-2" />
                {t('setup_username')}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('back')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      addToast({ type: 'error', title: t('validation_failed'), message: t('fill_required_fields') })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        addToast({ type: 'success', title: t('success'), message: t('project_created_successfully') })
        router.push(`/dashboard/projects/${data.project?.id || ''}`)
      } else {
        const err = await response.json().catch(() => ({}))
        addToast({ type: 'error', title: t('failed'), message: err.error || t('failed_create_project') })
      }
    } catch (error) {
      addToast({ type: 'error', title: t('error'), message: t('error_creating_project') })
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = t('project_name_required')
    }

    if (!formData.status) {
      newErrors.status = t('project_status_required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  // Check if all required fields are filled
  const isFormValid = formData.name.trim() && formData.status && formData.endDate

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:bg-gray-100 px-8 py-3 rounded-[8px]"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('back')}
              </button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-3xl font-bold text-gray-900">{t('create new project')}</h1>
                <p className="text-gray-600 text-sm mt-1">{t('create new project subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-[8px] shadow-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Form Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Project Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                      {t('project name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 hover:border-gray-400 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={t('enter project name')}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
                      {t('description')}
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none hover:border-gray-400"
                      placeholder={t('describe this project')}
                    />
                    <p className="text-xs text-gray-500">{t('you can edit later')}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Status */}
                  <div className="space-y-2">
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-900">
                      {t('project status')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white hover:border-gray-400 ${
                        errors.status ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="PLANNING">{t('planning')}</option>
                      <option value="ACTIVE">{t('active')}</option>
                      <option value="ON_HOLD">{t('on_hold')}</option>
                      <option value="COMPLETED">{t('completed')}</option>
                    </select>
                    {errors.status && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.status}
                      </p>
                    )}
                  </div>


                  {/* End Date */}
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="block text-sm font-semibold text-gray-900">
                      {t('end date')}
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 hover:border-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-8 py-6">
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600 rounded-[8px] font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-[8px] font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('create project')}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
