import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-themed flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200 border-t-transparent loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat dashboard...</p>
          </div>
        </div>
      }>
        <DashboardLayout>{children}</DashboardLayout>
      </Suspense>
    </ErrorBoundary>
  )
}
