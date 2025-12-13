"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/Button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log untuk debugging saat dev
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#DEFAD9] border border-[#DEFAD9] rounded-[8px] p-6 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-[#166534] mb-2">Terjadi Kesalahan</h2>
        <p className="text-gray-700 mb-4">Maaf, sesuatu tidak berjalan dengan baik. Coba muat ulang halaman.</p>
        <div className="flex items-center justify-center gap-2">
          <Button onClick={() => reset && reset()} variant="primary">Muat Ulang</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>Ke Beranda</Button>
        </div>
      </div>
    </div>
  )
}


