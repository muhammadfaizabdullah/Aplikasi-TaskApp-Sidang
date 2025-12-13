'use client'

import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

export default function TestPage() {
  const router = useRouter()

  const handleTest = () => {
    alert('Button berfungsi!')
  }

  const handleNavigate = () => {
    router.push('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-center">Test Buttons</h1>
        
        <div className="space-y-4">
          <Button 
            onClick={handleTest}
            className="w-full"
            variant="primary"
          >
            Test Alert
          </Button>
          
          <Button 
            onClick={handleNavigate}
            className="w-full"
            variant="outline"
          >
            Navigate to Sign In
          </Button>
          
          <Button 
            onClick={() => router.push('/auth/signup')}
            className="w-full"
            variant="secondary"
          >
            Navigate to Sign Up
          </Button>
          
          <Button 
            onClick={() => router.push('/')}
            className="w-full"
            variant="ghost"
          >
            Back to Home
          </Button>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          Jika semua button berfungsi, maka masalah sudah teratasi
        </div>
      </div>
    </div>
  )
}
