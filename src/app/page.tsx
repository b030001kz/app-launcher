'use client'

import { useEffect, useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, ExternalLink, Settings, Folder, Tag, Filter, LayoutGrid } from 'lucide-react'
import Link from 'next/link'

type AppWithRelations = Database['public']['Tables']['apps']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null
  projects: Database['public']['Tables']['projects']['Row'] | null
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [apps, setApps] = useState<AppWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'全て' | '採用' | '保留' | '除外'>('全て')
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all')

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

  const projectMap = new Map<string, NonNullable<AppWithRelations['projects']>>()
  apps.forEach(app => {
    if (app.projects) {
      projectMap.set(app.projects.id, app.projects)
    }
  })
  const projects = Array.from(projectMap.values())

  const filteredApps = apps.filter(app => {
    const matchesSearch =
      (app.display_name?.toLowerCase().includes(search.toLowerCase())) ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.description?.toLowerCase().includes(search.toLowerCase())) ||
      (app.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase())))

    const matchesStatus = statusFilter === '全て' || app.status === statusFilter
    if (statusFilter === '全て' && app.status === '除外') return false

    const matchesProject = selectedProjectId === 'all' || app.project_id === selectedProjectId

    return matchesSearch && matchesStatus && matchesProject
  })

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-400 animate-pulse text-lg font-medium">Loading Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col sm:flex-row">
      {/* Dynamic Sidebar */}
      <aside className="w-full sm:w-64 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">App Launcher</h1>
          </div>

          <nav className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Projects</p>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedProjectId('all')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${selectedProjectId === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  すべてのアプリ
                </button>
                {projects.map(project => (
                  <button
                    key={project?.id}
                    onClick={() => setSelectedProjectId(project?.id || 'all')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${selectedProjectId === project?.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    <Folder className="h-4 w-4" />
                    <span className="truncate">{project?.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Actions</p>
              <div className="space-y-1">
                <Link href="/apps/new">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-all">
                    <Plus className="h-4 w-4 text-indigo-500" />
                    アプリを手動追加
                  </button>
                </Link>
                <Link href="/import">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-all">
                    <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-slate-400">
                      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                    </svg>
                    Vercelから同期
                  </button>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="検索内容を入力..."
              className="pl-10 bg-slate-100/50 border-none focus-visible:ring-indigo-500 h-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9 border border-slate-200 shadow-sm',
                },
              }}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc] custom-scrollbar">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {selectedProjectId === 'all' ? 'Your Applications' : projects.find(p => p?.id === selectedProjectId)?.name}
              </h2>
              <p className="text-sm text-slate-500">
                {filteredApps.length} 個のアプリケーションが見つかりました
              </p>
            </div>
            <div className="flex gap-1.5 p-1 bg-slate-200/50 rounded-xl">
              {(['全て', '採用', '保留'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === status
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {status}
                </button>
              ))}
              <button
                onClick={() => setStatusFilter('除外')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === '除外'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                Archive
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApps.map(app => (
              <Card key={app.id} className="group border-none shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 bg-white rounded-2xl overflow-hidden ring-1 ring-slate-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                        {app.icon || '📱'}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-bold text-slate-900 truncate tracking-tight">{app.display_name || app.name}</CardTitle>
                        {app.display_name && (
                          <p className="text-[10px] text-slate-400 font-mono truncate">{app.name}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${app.status === '採用' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{app.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {app.description || 'No description available for this application.'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {app.categories && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full font-bold">
                        <Tag className="h-3 w-3" />
                        {app.categories.name}
                      </span>
                    )}
                    {app.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-6 px-6 flex gap-3">
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200">
                      <ExternalLink className="h-4 w-4" />
                      Launch
                    </Button>
                  </a>
                  <Link href={`/apps/${app.id}`}>
                    <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50 hover:text-indigo-600 px-3">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">アプリが見つかりません</h3>
              <p className="text-sm text-slate-500 mt-1">検索条件を変えてみてください</p>
              <Button variant="link" className="mt-4 text-indigo-600 font-bold" onClick={() => { setSearch(''); setStatusFilter('全て'); setSelectedProjectId('all'); }}>
                リセットする
              </Button>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
