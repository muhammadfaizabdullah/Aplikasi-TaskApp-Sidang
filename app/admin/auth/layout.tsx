"use client"

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200">
      {children}
    </div>
  )
}

