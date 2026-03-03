'use client'

import { useEffect, useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, ExternalLink, Settings } from 'lucide-react'
import Link from 'next/link'

type AppRow = Database['public']['Tables']['apps']['Row']

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [apps, setApps] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'全て' | '採用' | '保留' | '除外'>('全て')

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    const fetchApps = async () => {
      try {
        const res = await fetch('/api/apps')
        if (res.ok) {
          const data = await res.json()
          setApps(data)
        }
      } catch (err) {
        console.error('Failed to fetch apps:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchApps()
  }, [isLoaded, isSignedIn])

  const filteredApps = apps.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.description?.toLowerCase().includes(search.toLowerCase())) ||
      (app.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase())))

    const matchesStatus = statusFilter === '全て' || app.status === statusFilter
    if (statusFilter === '全て' && app.status === '除外') return false

    return matchesSearch && matchesStatus
  })

  const statusColors = {
    '採用': 'bg-emerald-500',
    '保留': 'bg-amber-500',
    '除外': 'bg-slate-400',
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <p className="text-slate-400 animate-pulse text-lg">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">App Launcher</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/import">
              <Button size="sm" variant="outline" className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50">
                <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 fill-current">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                <span className="hidden sm:inline">Vercel連携</span>
                <span className="sm:hidden text-[10px]">連携</span>
              </Button>
            </Link>
            <Link href="/apps/new">
              <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">追加</span>
              </Button>
            </Link>
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="アプリ名、タグ、説明を検索..."
              className="pl-9 bg-white border-slate-200 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {(['全て', '採用', '保留', '除外'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${statusFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.length > 0 ? (
            filteredApps.map(app => (
              <Card key={app.id} className="group hover:shadow-lg transition-all duration-200 bg-white border-slate-200 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0 w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      {app.icon || '📱'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base truncate">{app.name}</CardTitle>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[app.status]}`} />
                      </div>
                      <CardDescription className="line-clamp-2 text-xs mt-1">
                        {app.description || '説明なし'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {app.tags && app.tags.length > 0 && (
                  <CardContent className="pb-3 pt-0">
                    <div className="flex flex-wrap gap-1">
                      {app.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                )}
                <CardFooter className="pt-0 pb-4 flex gap-2">
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="default" size="sm" className="w-full gap-1.5 bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="h-3.5 w-3.5" />
                      開く
                    </Button>
                  </a>
                  <Link href={`/apps/${app.id}`}>
                    <Button variant="outline" size="sm" className="border-slate-200">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-slate-500 mb-2">アプリが見つかりません</p>
              <Button variant="link" className="text-blue-600" onClick={() => { setSearch(''); setStatusFilter('全て'); }}>
                フィルタをリセット
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
