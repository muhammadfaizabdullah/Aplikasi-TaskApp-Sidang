"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { Users, UserPlus, Search } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"

export default function TeamPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [members, setMembers] = useState<Array<{
    id: string;
    username: string;
    name?: string;
    email: string;
    image?: string;
    project: { id: string; name: string } | null;
    role: string;
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      setError("")
      const res = await fetch('/api/team', { cache: 'no-store' })
      if (!res.ok) throw new Error('Gagal memuat anggota tim')
      const data = await res.json()
      const normalized: Array<{
        id: string; username: string; name?: string; email: string; image?: string;
        project: { id: string; name: string } | null; role: string;
      }> = (data.members || []).map((m: any) => ({
        id: m.user.id,
        username: m.user.username,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        project: m.project || null,
        role: m.role,
      }))
      // Deduplicate by user id (bila user muncul di banyak project)
      const uniqueById: typeof normalized = Array.from(new Map(normalized.map((u) => [u.id, u])).values())
      setMembers(uniqueById)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = members.filter(m => {
    const text = `${m.name || ''} ${m.username} ${m.email}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('team')}</h1>
          <p className="text-gray-600 text-sm sm:text-base">{t('team_subtitle')}</p>
        </div>
        <Button onClick={() => router.push('/dashboard/team/add-member')} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto" suppressHydrationWarning={true}>
          <UserPlus className="w-4 h-4 mr-2 text-white" /> {t('add_member')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('team_search_placeholder')}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-[8px] bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary text-sm sm:text-base"
            suppressHydrationWarning={true}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={fetchMembers}
          className="bg-theme-button hover:bg-theme-button-hover text-theme-text border-theme-border w-full sm:w-auto"
          suppressHydrationWarning={true}
        >
          {t('refresh')}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12 sm:py-16">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map(member => (
            <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar src={member.image} alt={member.name || member.username} fallback={member.username} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate text-sm sm:text-base">{member.name || member.username}</div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">@{member.username}</div>
                </div>
              </div>
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 break-words">{member.email}</div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  className={`${session?.user?.id !== member.id ? "flex-1" : "w-full"} btn-detail-theme text-xs sm:text-sm`} 
                  onClick={() => router.push(`/dashboard/team/${member.id}`)}
                  suppressHydrationWarning={true}
                >
                  {t('detail')}
                </Button>
                {session?.user?.id !== member.id && (
                  <Button className="flex-1 bg-[#F9A600] hover:bg-[#F9A600]/90 text-white text-xs sm:text-sm" onClick={() => router.push(`/dashboard/team/${member.id}/edit`)} suppressHydrationWarning={true}>{t('edit')}</Button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-8 sm:py-10 text-center text-gray-600 text-sm sm:text-base">{t('team_empty')}</div>
          )}
        </div>
      )}
    </div>
  )
}


