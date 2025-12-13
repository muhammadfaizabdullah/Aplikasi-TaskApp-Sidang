import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Manrope } from "next/font/google"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { Toaster, ToastProvider } from "@/components/ui/Toaster"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { LanguageProvider } from "@/components/providers/LanguageProvider"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "TaskApp - Kelola Tugas Tim Anda",
  description: "Solusi manajemen tugas terbaik untuk tim Anda",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${geist.variable} ${manrope.variable} antialiased`}>
      <body className="font-sans bg-themed">
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}





