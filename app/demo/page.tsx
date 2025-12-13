"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import Kelola1 from "../../image/icons/kelola-1.png"
import Kelola2 from "../../image/icons/kelola-2.png"
import Kelola3 from "../../image/icons/kelola-3.png"
import Kelola4 from "../../image/icons/kelola-4.png"

export default function DemoPage() {
  const router = useRouter()
  const steps = [
    { title: "Langkah 1", desc: "Mulai dari ide dan requirement.", img: Kelola2 },
    { title: "Langkah 2", desc: "Buat daftar tugas terstruktur.", img: Kelola1 },
    { title: "Langkah 3", desc: "Kelola project dan kolaborasi.", img: Kelola3 },
    { title: "Langkah 4", desc: "Pantau progres dan hasil.", img: Kelola4 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demo Alur Project</h1>
          <button onClick={() => router.back()} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">Kembali</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-4 p-6 rounded-[8px] bg-white shadow-sm border border-gray-200">
              <div className="shrink-0">
                <Image src={s.img} alt={s.title} width={96} height={96} className="w-24 h-24" />
              </div>
              <div>
                <div className="text-sm text-gray-500">{s.title}</div>
                <div className="text-lg font-semibold text-gray-900">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-gray-500">
          Ini adalah halaman demo kosong yang menampilkan langkah-langkah menggunakan ikon.
        </div>
      </div>
    </div>
  )
}
 
