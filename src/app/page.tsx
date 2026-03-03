'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, ExternalLink, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type AppRow = Database['public']['Tables']['apps']['Row']

function DashboardContent() {
  const [apps, setApps] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'全て' | '採用' | '保留' | '除外'>('全て')
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthAndFetch = async () => {
      // URLにcodeパラメータがある場合、セッションを確立する
      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          // URLからcodeパラメータを除去
          router.replace('/')
          return
        }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error fetching apps:', error)
      } else {
        setApps(data || [])
      }
      setLoading(false)
    }

    handleAuthAndFetch()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredApps = apps.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.description?.toLowerCase().includes(search.toLowerCase())) ||
      (app.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase())))

    const matchesStatus = statusFilter === '全て' || app.status === statusFilter

    if (statusFilter === '全て' && app.status === '除外') return false

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">App Launcher</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
          <Link href="/apps/new">
            <Button size="icon" className="rounded-full shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="アプリ名、タグ、説明を検索..."
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-sm">
            {(['全て', '採用', '保留', '除外'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-full border whitespace-nowrap transition-colors ${statusFilter === status
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white text-muted-foreground hover:bg-slate-100'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* App List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredApps.length > 0 ? (
            filteredApps.map(app => (
              <Card key={app.id} className="group hover:shadow-md transition-shadow relative overflow-hidden bg-white">
                <div className={`absolute top-0 right-0 w-12 h-12 flex items-center justify-center rotate-45 translate-x-3 -translate-y-3 ${app.status === '採用' ? 'bg-green-100/50' : app.status === '保留' ? 'bg-amber-100/50' : 'bg-slate-100/50'
                  }`} />

                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="text-4xl flex-shrink-0 w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {app.icon || '📱'}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{app.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{app.description || '説明なし'}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-1">
                    {app.tags?.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="default" className="w-full gap-2">
                      <ExternalLink className="h-4 w-4" />
                      開く
                    </Button>
                  </a>
                  <Link href={`/apps/${app.id}`}>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground">アプリが見つかりません</p>
              <Button variant="link" onClick={() => { setSearch(''); setStatusFilter('全て'); }}>
                フィルタをリセット
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-md border-t px-4 py-2 text-[10px] text-center text-muted-foreground sm:hidden">
        ホーム画面に追加してフルスクリーンで利用できます
      </footer>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">読み込み中...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
