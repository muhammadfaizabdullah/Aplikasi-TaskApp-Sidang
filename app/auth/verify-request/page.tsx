'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Cek Email Anda
          </h2>
          <p className="text-muted-foreground">
            Kami telah mengirim link verifikasi ke email Anda
          </p>
        </div>

        <div className="bg-card py-8 px-4 shadow-sm border border-border rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Langkah Selanjutnya
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Buka email Anda</li>
                      <li>Cari email dari TaskApp</li>
                      <li>Klik link verifikasi di dalam email</li>
                      <li>Anda akan otomatis masuk ke dashboard</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <RefreshCw className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Tidak Menerima Email?
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Periksa folder spam/junk</li>
                      <li>Pastikan email yang dimasukkan benar</li>
                      <li>Tunggu beberapa menit</li>
                      <li>Jika masih belum ada, coba kirim ulang</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full">
                  Kirim Ulang Email
                </Button>
              </Link>

              <Link href="/auth/signin">
                <Button variant="outline" className="w-full">
                  Kembali ke Login
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Link verifikasi akan kadaluarsa dalam 24 jam
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
