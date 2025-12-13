"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Kelola1 from "../image/icons/kelola-1.png"
import Kelola2 from "../image/icons/kelola-2.png"
import Kelola3 from "../image/icons/kelola-3.png"
import Kelola4 from "../image/icons/kelola-4.png"
import ArtIcon from "../image/art.png"
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function HomePage() {
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentTheme, setCurrentTheme] = useState('green')

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  // Function to change theme color
  const changeTheme = (theme: string) => {
    setCurrentTheme(theme)
    
    // Store theme in localStorage
    localStorage.setItem('taskapp-theme', theme)
    
    // Set data-theme attribute for CSS custom properties
    document.documentElement.setAttribute('data-theme', theme)
    
    // Hide theme picker
    const picker = document.getElementById('theme-picker');
    if (picker) {
      picker.classList.add('hidden');
    }
  }

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('taskapp-theme')
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      // Set default theme
      document.documentElement.setAttribute('data-theme', 'green')
    }
  }, [])

  // Close theme picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const picker = document.getElementById('theme-picker')
      const button = document.getElementById('theme-button')
      if (picker && button && !picker.contains(event.target as Node) && !button.contains(event.target as Node)) {
        picker.classList.add('hidden')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Helper function to get theme colors
  const getThemeColors = () => {
    switch (currentTheme) {
      case 'blue':
        return {
          primary: 'from-blue-600 to-blue-700',
          secondary: 'from-blue-500 to-blue-600',
          accent: 'from-blue-400 to-blue-500',
          light: 'from-blue-50 to-blue-100',
          text: 'text-blue-600',
          bg: 'bg-blue-50',
          hover: 'hover:bg-blue-100',
          border: 'border-blue-200',
          shadow: 'hover:shadow-blue-500/25'
        }
      case 'purple':
        return {
          primary: 'from-purple-600 to-purple-700',
          secondary: 'from-purple-500 to-purple-600',
          accent: 'from-purple-400 to-purple-500',
          light: 'from-purple-50 to-purple-100',
          text: 'text-purple-600',
          bg: 'bg-purple-50',
          hover: 'hover:bg-purple-100',
          border: 'border-purple-200',
          shadow: 'hover:shadow-purple-500/25'
        }
      case 'green':
      default:
        return {
          primary: 'from-green-600 to-green-700',
          secondary: 'from-green-500 to-green-600',
          accent: 'from-green-400 to-green-500',
          light: 'from-green-50 to-green-100',
          text: 'text-green-600',
          bg: 'bg-green-50',
          hover: 'hover:bg-green-100',
          border: 'border-green-200',
          shadow: 'hover:shadow-green-500/25'
        }
    }
  }

  const themeColors = getThemeColors()

  const containerRef = useRef<HTMLDivElement>(null)

  function WanderingCluster({ img, initial, sizes }: { img: any; initial: { x: number; y: number }; sizes: [number, number, number] }) {
    const leaderRef = useRef<{ x: number; y: number }>({ x: initial.x, y: initial.y })
    const [leaderPos, setLeaderPos] = useState<{ x: number; y: number }>(leaderRef.current)
    const [f1Pos, setF1Pos] = useState<{ x: number; y: number }>({ x: initial.x + 40, y: initial.y + 30 })
    const [f2Pos, setF2Pos] = useState<{ x: number; y: number }>({ x: initial.x - 30, y: initial.y + 50 })
    const vel = useRef<{ vx: number; vy: number }>({ vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6 })
    const dragging = useRef(false)
    const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

    useEffect(() => {
      let raf: number
      const tick = () => {
        const el = containerRef.current
        if (el && !dragging.current) {
          const r = el.getBoundingClientRect()
          // random walk (slower)
          vel.current.vx += (Math.random()-0.5)*0.03
          vel.current.vy += (Math.random()-0.5)*0.03
          const max = 1
          vel.current.vx = Math.max(-max, Math.min(max, vel.current.vx))
          vel.current.vy = Math.max(-max, Math.min(max, vel.current.vy))

          let nx = leaderRef.current.x + vel.current.vx * 3
          let ny = leaderRef.current.y + vel.current.vy * 3
          const size = sizes[0]
          const maxX = r.width - size
          const maxY = r.height - size
          if (nx < 0 || nx > maxX) { vel.current.vx *= -1; nx = Math.max(0, Math.min(maxX, nx)) }
          if (ny < 0 || ny > maxY) { vel.current.vy *= -1; ny = Math.max(0, Math.min(maxY, ny)) }
          leaderRef.current = { x: nx, y: ny }
          setLeaderPos(leaderRef.current)
        }
        // followers ease to leader
        setF1Pos(p => ({ x: p.x + (leaderRef.current.x + sizes[0]*0.35 - p.x)*0.1, y: p.y + (leaderRef.current.y + sizes[0]*0.25 - p.y)*0.1 }))
        setF2Pos(p => ({ x: p.x + (leaderRef.current.x - sizes[0]*0.25 - p.x)*0.08, y: p.y + (leaderRef.current.y + sizes[0]*0.45 - p.y)*0.08 }))
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }, [sizes])

    const onDown = (e: React.PointerEvent) => {
      if (typeof e.button === 'number' && e.button !== 0) return
      dragging.current = true
      const el = containerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = e.clientX - r.left
      const cy = e.clientY - r.top
      dragOffset.current = { x: cx - leaderRef.current.x, y: cy - leaderRef.current.y }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }
    const onMove = (e: React.PointerEvent) => {
      if (!dragging.current) return
      const el = containerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const size = sizes[0]
      const nx = e.clientX - r.left - dragOffset.current.x
      const ny = e.clientY - r.top - dragOffset.current.y
      leaderRef.current = { x: Math.max(0, Math.min(r.width - size, nx)), y: Math.max(0, Math.min(r.height - size, ny)) }
      setLeaderPos(leaderRef.current)
    }
    const onUp = (e: React.PointerEvent) => {
      dragging.current = false
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    }

    return (
      <>
        <Image src={img} alt="leader" width={sizes[0]} height={sizes[0]} priority className="absolute select-none pointer-events-auto cursor-grab active:cursor-grabbing" style={{ left: leaderPos.x, top: leaderPos.y, width: sizes[0], height: sizes[0] }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} />
        <Image src={img} alt="f1" width={sizes[1]} height={sizes[1]} priority className="absolute opacity-80 select-none pointer-events-none" style={{ left: f1Pos.x, top: f1Pos.y, width: sizes[1], height: sizes[1] }} />
        <Image src={img} alt="f2" width={sizes[2]} height={sizes[2]} priority className="absolute opacity-70 select-none pointer-events-none" style={{ left: f2Pos.x, top: f2Pos.y, width: sizes[2], height: sizes[2] }} />
      </>
    )
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 mt-4 text-lg">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--theme-bg-start))] via-[rgb(var(--theme-bg-middle))] to-[rgb(var(--theme-bg-end))]">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="relative">
                <div className={`w-10 h-10 bg-gradient-to-br ${themeColors.primary} rounded-[8px] flex items-center justify-center mr-3 shadow-lg`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10h7l-9 13v-9H4l9-13v9z"/>
                  </svg>
                </div>
                <div className={`absolute -inset-1 bg-gradient-to-br ${themeColors.primary} rounded-[8px] blur opacity-20`}></div>
              </div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r ${themeColors.primary} bg-clip-text text-transparent`}>TaskApp</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/auth/signin")}
                className={`text-black hover:text-black px-6 py-3 rounded-[8px] text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  currentTheme === 'green' ? 'hover:bg-[#F9A600] hover:text-white' :
                  currentTheme === 'blue' ? 'hover:bg-blue-200 hover:text-blue-800' :
                  'hover:bg-purple-200 hover:text-purple-800'
                }`}
              >
                {t('sign in')}
              </button>
              <button
                onClick={() => router.push("/auth/signin")}
                className={`bg-gradient-to-r ${themeColors.primary} text-white px-6 py-3 rounded-[8px] hover:shadow-lg ${themeColors.shadow} transition-all duration-300 hover:scale-105 font-medium`}
              >
                {t('sign up')}
              </button>
              <div className="relative group">
                <button
                  id="theme-button"
                  onClick={() => {
                    // Toggle theme picker
                    const picker = document.getElementById('theme-picker');
                    if (picker) {
                      picker.classList.toggle('hidden');
                    }
                  }}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-indigo-600 rounded-[8px] flex items-center justify-center transition-all duration-300 hover:scale-105"
                  title="Pilih Tema Warna"
                >
                  <Image src={ArtIcon} alt="Art" width={20} height={20} className="w-5 h-5 object-contain" />
                </button>
                
                {/* Theme Picker Dropdown - Warna Tetap Konsisten */}
                <div id="theme-picker" className="absolute right-0 top-12 hidden bg-white rounded-[8px] shadow-2xl border border-gray-200 p-4 w-32 z-50">
                  <div className="text-sm font-medium text-gray-700 mb-3">Pilih Tema</div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Tema Hijau - Selalu di Posisi Kiri */}
                    <button
                      onClick={() => changeTheme('green')}
                      className={`w-10 h-10 bg-green-500 rounded-[8px] hover:scale-110 transition-transform duration-200 ${
                        currentTheme === 'green' ? 'ring-2 ring-green-300 ring-offset-2' : ''
                      }`}
                      title="Tema Hijau"
                    ></button>
                    
                    {/* Tema Biru - Selalu di Posisi Tengah */}
                    <button
                      onClick={() => changeTheme('blue')}
                      className={`w-10 h-10 bg-blue-500 rounded-[8px] hover:scale-110 transition-transform duration-200 ${
                        currentTheme === 'blue' ? 'ring-2 ring-blue-300 ring-offset-2' : ''
                      }`}
                      title="Tema Biru"
                    ></button>
                    
                    {/* Tema Ungu - Selalu di Posisi Kanan */}
                    <button
                      onClick={() => changeTheme('purple')}
                      className={`w-10 h-10 bg-purple-500 rounded-[8px] hover:scale-110 transition-transform duration-200 ${
                        currentTheme === 'purple' ? 'ring-2 ring-purple-300 ring-offset-2' : ''
                      }`}
                      title="Tema Ungu"
                    ></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#F0FDF4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-36">
          <div className="text-center relative z-10">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${themeColors.bg} ${themeColors.text} text-sm font-medium mb-8 border ${themeColors.border}/50`}>
              ✨ Platform Kolaborasi Terdepan di Indonesia
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Kelola Project Tim Anda dengan
              <span className={`bg-gradient-to-r ${themeColors.primary} bg-clip-text text-transparent`}> Mudah</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              TaskApp adalah platform kolaborasi yang memudahkan tim Anda mengelola project, 
              tugas, dan deadline dengan efisien. Tingkatkan produktivitas tim sekarang!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button
                onClick={() => router.push("/auth/signin")}
                className={`group relative bg-gradient-to-r ${themeColors.primary} text-white px-10 py-5 rounded-[8px] hover:shadow-2xl ${themeColors.shadow} transition-all duration-300 hover:scale-105 text-lg font-semibold overflow-hidden`}
              >
                <span className="relative z-10">{t('start free')}</span>
                <div className={`absolute inset-0 bg-gradient-to-r ${themeColors.secondary} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </button>
              <button
                onClick={() => router.push("/demo")}
                className={`group border-2 border-gray-300 text-gray-700 px-10 py-5 rounded-[8px] transition-all duration-300 hover:scale-105 text-lg font-semibold backdrop-blur-sm ${
                  currentTheme === 'green' ? 'hover:border-[#F9A600] hover:bg-[#F9A600] hover:text-white' :
                  currentTheme === 'blue' ? 'hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800' :
                  'hover:border-purple-300 hover:bg-purple-100 hover:text-purple-800'
                }`}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('view demo')}
                </span>
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className={`text-3xl font-bold ${themeColors.text} mb-2`}>10K+</div>
                <div className="text-gray-600 text-sm">Tim Aktif</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${themeColors.text} mb-2`}>50K+</div>
                <div className="text-gray-600 text-sm">Project Selesai</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${themeColors.text} mb-2`}>99%</div>
                <div className="text-gray-600 text-sm">Kepuasan</div>
              </div>
            </div>
          </div>
        </div>
        {/* Animated background for Hero: organic blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-6 w-40 h-40 shape-blob bg-green-300 animate-float"></div>
          <div className="absolute top-32 right-10 w-24 h-24 shape-blob bg-emerald-200 animate-float-reverse"></div>
          <div className="absolute bottom-20 left-1/3 w-64 h-64 shape-blob bg-green-200 animate-wave"></div>
          <div className="absolute top-1/2 right-1/3 w-52 h-52 shape-blob bg-emerald-300 animate-drift"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-32 bg-[#F0FDF4] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${themeColors.bg} ${themeColors.text} text-sm font-medium mb-6 border ${themeColors.border}/50`}>
              🚀 Fitur Unggulan
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Platform lengkap untuk mengelola project tim dengan efisien dan produktif
            </p>
          </div>

          {/* Animated background for Features: squares */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-4 left-10 w-10 h-10 bg-blue-200 shape-square animate-zigzag"></div>
            <div className="absolute top-1/3 right-20 w-8 h-8 bg-purple-200 shape-square animate-drift"></div>
            <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-green-200 shape-square animate-float"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-yellow-200 shape-square animate-float-reverse"></div>
            <div className="absolute top-8 right-10 w-6 h-6 bg-rose-200 shape-square animate-float"></div>
            <div className="absolute bottom-6 right-1/4 w-10 h-10 bg-indigo-200 shape-square animate-drift-reverse"></div>
            <div className="absolute top-1/4 left-1/5 w-7 h-7 bg-teal-200 shape-square animate-zigzag"></div>
            <div className="absolute bottom-1/3 left-10 w-9 h-9 bg-amber-200 shape-square animate-float"></div>
            <div className="absolute top-1/3 left-1/2 w-5 h-5 bg-lime-200 shape-square animate-drift"></div>
            <div className="absolute bottom-1/4 right-1/2 w-8 h-8 bg-sky-200 shape-square animate-float-reverse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Feature 1 */}
            <div className={`group relative p-8 rounded-[8px] bg-white/80 backdrop-blur-sm border border-white/30 hover:bg-white/95 hover:shadow-2xl ${themeColors.shadow.replace('hover:', '')}/10 transition-all duration-500 hover:scale-105`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${themeColors.light} rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className="relative z-10">
                <div className={`w-20 h-20 bg-gradient-to-br ${themeColors.primary} rounded-[8px] flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-4xl">📁</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Project Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Buat dan kelola project dengan mudah. Pantau progress, deadline, dan status project secara real-time dengan dashboard yang intuitif.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className={`group relative p-8 rounded-[8px] bg-white/80 backdrop-blur-sm border border-white/30 hover:bg-white/95 hover:shadow-2xl ${themeColors.shadow.replace('hover:', '')}/10 transition-all duration-500 hover:scale-105`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${themeColors.light} rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className="relative z-10">
                <div className={`w-20 h-20 bg-gradient-to-br ${themeColors.primary} rounded-[8px] flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-4xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Task Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Buat, assign, dan track tugas dengan sistem prioritas dan deadline yang fleksibel. Monitor progress tim secara real-time.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className={`group relative p-8 rounded-[8px] bg-white/80 backdrop-blur-sm border border-white/30 hover:bg-white/95 hover:shadow-2xl ${themeColors.shadow.replace('hover:', '')}/10 transition-all duration-500 hover:scale-105`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${themeColors.light} rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className="relative z-10">
                <div className={`w-20 h-20 bg-gradient-to-br ${themeColors.primary} rounded-[8px] flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-4xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Team Collaboration</h3>
                <p className="text-gray-600 leading-relaxed">
                  Kolaborasi tim yang seamless dengan sistem role, permission, dan komunikasi yang terintegrasi untuk produktivitas maksimal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-32 bg-[#F0FDF4] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${themeColors.bg} ${themeColors.text} text-sm font-medium mb-6 border ${themeColors.border}/50`}>
              ⚡ Cara Kerja
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Hanya Butuh 3 Langkah
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proses sederhana untuk memulai kolaborasi tim yang produktif
            </p>
          </div>

          {/* Animated background for How It Works: triangles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="shape-triangle absolute top-10 left-16 bg-pink-300 animate-float"></div>
            <div className="shape-triangle absolute top-1/3 right-24 bg-cyan-300 animate-drift"></div>
            <div className="shape-triangle absolute bottom-14 left-1/3 bg-violet-300 animate-float-reverse"></div>
            <div className="shape-triangle absolute top-1/2 right-1/2 bg-amber-300 animate-spiral"></div>
            <div className="shape-triangle absolute top-20 right-10 bg-green-300 animate-float"></div>
            <div className="shape-triangle absolute bottom-10 right-1/4 bg-blue-300 animate-drift-reverse"></div>
            <div className="shape-triangle absolute top-1/4 left-1/5 bg-purple-300 animate-zigzag"></div>
            <div className="shape-triangle absolute bottom-1/4 left-8 bg-rose-300 animate-float"></div>
            <div className="shape-triangle absolute top-1/2 left-1/2 bg-teal-300 animate-drift"></div>
            <div className="shape-triangle absolute bottom-1/3 right-1/3 bg-emerald-300 animate-wave"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="group text-center">
              <div className="relative mb-8">
                <div className={`w-24 h-24 bg-gradient-to-br ${themeColors.primary} rounded-full flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-lg group-hover:shadow-2xl ${themeColors.shadow.replace('hover:', '')}/25 transition-all duration-300 group-hover:scale-110`}>
                  1
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${themeColors.primary} rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Daftar & Login</h3>
              <p className="text-gray-600 leading-relaxed">
                Buat akun gratis dan login ke platform TaskApp dalam hitungan menit
              </p>
            </div>

            {/* Step 2 */}
            <div className="group text-center">
              <div className="relative mb-8">
                <div className={`w-24 h-24 bg-gradient-to-br ${themeColors.primary} rounded-full flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-lg group-hover:shadow-2xl ${themeColors.shadow.replace('hover:', '')}/25 transition-all duration-300 group-hover:scale-110`}>
                  2
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${themeColors.primary} rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Buat Project</h3>
              <p className="text-gray-600 leading-relaxed">
                Buat project baru dan undang anggota tim dengan mudah
              </p>
            </div>

            {/* Step 3 */}
            <div className="group text-center">
              <div className="relative mb-8">
                <div className={`w-24 h-24 bg-gradient-to-br ${themeColors.primary} rounded-full flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-lg group-hover:shadow-2xl ${themeColors.shadow.replace('hover:', '')}/25 transition-all duration-300 group-hover:scale-110`}>
                  3
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${themeColors.primary} rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Kelola & Kolaborasi</h3>
              <p className="text-gray-600 leading-relaxed">
                Mulai mengelola tugas dan berkolaborasi dengan tim secara real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-32 bg-gradient-to-r ${themeColors.primary} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className={`absolute inset-0 bg-gradient-to-r ${themeColors.primary}/90`}></div>
        {/* Animated light particles - subtle white glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="cta-light left-[10%] top-[20%] w-[160px] h-[160px]"></div>
          <div className="cta-light left-[70%] top-[25%] w-[220px] h-[220px]"></div>
          <div className="cta-light left-[30%] top-[65%] w-[180px] h-[180px]"></div>
          <div className="cta-light left-[85%] top-[70%] w-[140px] h-[140px]"></div>
          <div className="cta-light left-[5%] top-[80%] w-[260px] h-[260px]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Siap Meningkatkan Produktivitas Tim?
          </h2>
          <p className={`text-xl text-${currentTheme}-100 mb-10 max-w-3xl mx-auto leading-relaxed`}>
            Bergabunglah dengan ribuan tim yang sudah menggunakan TaskApp untuk mengelola project mereka dengan efisien
          </p>
          <button
            onClick={() => router.push("/auth/signin")}
            className={`group bg-white text-gray-700 px-10 py-5 rounded-[8px] hover:shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 text-lg font-semibold relative overflow-hidden ${
              currentTheme === 'green' ? 'hover:bg-[#F9A600] hover:text-white' :
              currentTheme === 'blue' ? 'hover:bg-blue-100 hover:text-blue-800' :
              'hover:bg-purple-100 hover:text-purple-800'
            }`}
          >
            <span className="relative z-10">{t('start now free')}</span>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              currentTheme === 'green' ? 'bg-[#F9A600]' :
              currentTheme === 'blue' ? 'bg-blue-100' :
              'bg-purple-100'
            }`}></div>
          </button>
        </div>
        
        {/* Background Elements (kept minimal as lights now provide motion) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none"></div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <div className={`w-10 h-10 bg-gradient-to-br ${themeColors.primary} rounded-[8px] flex items-center justify-center mr-3 shadow-lg`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10h7l-9 13v-9H4l9-13v9z"/>
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold bg-gradient-to-r ${themeColors.accent} bg-clip-text text-transparent`}>TaskApp</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Platform kolaborasi tim terbaik untuk mengelola project dan tugas dengan efisien dan produktif.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Produk</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Project Management</li>
                <li className="hover:text-white transition-colors cursor-pointer">Task Management</li>
                <li className="hover:text-white transition-colors cursor-pointer">Team Collaboration</li>
                <li className="hover:text-white transition-colors cursor-pointer">Analytics</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Perusahaan</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Tentang Kami</li>
                <li className="hover:text-white transition-colors cursor-pointer">Karir</li>
                <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-white transition-colors cursor-pointer">Kontak</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Dukungan</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Bantuan</li>
                <li className="hover:text-white transition-colors cursor-pointer">Dokumentasi</li>
                <li className="hover:text-white transition-colors cursor-pointer">API</li>
                <li className="hover:text-white transition-colors cursor-pointer">Status</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TaskApp. Created by Muhammad Faiz Abdullah</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
