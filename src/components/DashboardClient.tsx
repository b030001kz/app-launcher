'use client'

import { useEffect, useState, useCallback } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, ExternalLink, Settings, Folder, Tag, LayoutGrid, Menu, X, Pencil, StickyNote, ArrowUpDown, Wrench, CheckCircle2, List, Settings2 } from 'lucide-react'
import Link from 'next/link'

type AppWithRelations = Database['public']['Tables']['apps']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null
  projects: Database['public']['Tables']['projects']['Row'] | null
  app_tasks: Database['public']['Tables']['app_tasks']['Row'][] | null
}

type Category = Database['public']['Tables']['categories']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type StatusType = '全て' | '採用' | '保留' | '除外' | '企画中'
type SortType = 'name' | 'created' | 'status'

interface DashboardClientProps {
  initialApps: AppWithRelations[]
}

export default function DashboardClient({ initialApps }: DashboardClientProps) {
  const { isLoaded, isSignedIn } = useUser()
  const [apps, setApps] = useState<AppWithRelations[]>(initialApps)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusType>('全て')
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortType>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showPropertiesMenu, setShowPropertiesMenu] = useState(false)
  const [visibleProps, setVisibleProps] = useState({
    icon: true,
    status: true,
    category: true,
    project: true,
    tags: true,
    notes: true,
    tasks: true,
    url: true,
  })

  // インライン編集用ステート
  const [editingDisplayName, setEditingDisplayName] = useState<string | null>(null)
  const [tempDisplayName, setTempDisplayName] = useState('')



  // Server Component側で認証状態が確保されるため、ここでのクライアントフェッチを削除
  // 必要に応じて再フェッチ（ブラウザ更新せず最新化）する場合は残すが、一旦シンプルにするため削除

  // プロジェクト一覧抽出
  const projects = Array.from(
    apps
      .reduce((map, app) => {
        if (app.projects?.id) {
          map.set(app.projects.id, app.projects)
        }
        return map
      }, new Map<string, NonNullable<AppWithRelations['projects']>>())
      .values()
  )

  // カテゴリ一覧抽出
  const categories = Array.from(
    apps
      .reduce((map, app) => {
        if (app.categories?.id) {
          map.set(app.categories.id, app.categories)
        }
        return map
      }, new Map<string, NonNullable<AppWithRelations['categories']>>())
      .values()
  )

  // フィルタリング
  const filteredApps = apps.filter(app => {
    const matchesSearch =
      (app.display_name?.toLowerCase().includes(search.toLowerCase())) ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.description?.toLowerCase().includes(search.toLowerCase())) ||
      (app.tags?.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())))

    const matchesStatus = statusFilter === '全て' || app.status === statusFilter
    if (statusFilter === '全て' && app.status === '除外') return false

    const matchesProject = selectedProjectId === 'all' || app.project_id === selectedProjectId
    const matchesCategory = selectedCategoryId === 'all' || app.category_id === selectedCategoryId

    return matchesSearch && matchesStatus && matchesProject && matchesCategory
  })

  // ソート
  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'name') return (a.display_name || a.name).localeCompare(b.display_name || b.name, 'ja')
    if (sortBy === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    // status順: 企画中 → 採用 → 保留 → 除外
    const order: Record<string, number> = { '企画中': 0, '採用': 1, '保留': 2, '除外': 3 }
    return (order[a.status] ?? 9) - (order[b.status] ?? 9)
  })

  // 表示名のインライン更新
  const handleSaveDisplayName = async (appId: string) => {
    try {
      const app = apps.find(a => a.id === appId)
      if (!app) return

      await fetch(`/api/apps/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: tempDisplayName || null })
      })

      setApps(prev => prev.map(a =>
        a.id === appId ? { ...a, display_name: tempDisplayName || null } : a
      ))
    } catch (err) {
      console.error('Failed to update display name:', err)
    } finally {
      setEditingDisplayName(null)
    }
  }

  // クイックステータス変更
  const handleQuickStatus = async (appId: string, newStatus: string) => {
    try {
      await fetch(`/api/apps/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      setApps(prev => prev.map(a =>
        a.id === appId ? { ...a, status: newStatus as any } : a
      ))
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  // 統計情報
  const stats = {
    total: apps.length,
    active: apps.filter(a => a.status === '採用').length,
    planning: apps.filter(a => a.status === '企画中').length,
    hold: apps.filter(a => a.status === '保留').length,
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-400 animate-pulse text-lg font-medium">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col sm:flex-row">
      {/* モバイルヘッダー */}
      <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100">
          {sidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <h1 className="text-base font-bold text-slate-800">App Launcher</h1>
        </div>
        <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
      </div>

      {/* サイドバー */}
      <aside className={`${sidebarOpen ? 'block' : 'hidden'} sm:block w-full sm:w-64 bg-white border-r border-slate-200 flex-shrink-0 ${sidebarOpen ? 'fixed inset-0 z-50 sm:relative' : ''}`}>
        {sidebarOpen && <div className="sm:hidden absolute inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />}
        <div className={`relative z-10 bg-white ${sidebarOpen ? 'w-72 h-full overflow-y-auto' : ''} p-5`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">App Launcher</h1>
          </div>

          {/* 統計 */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-[10px] text-slate-400 font-bold">合計</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-[10px] text-emerald-500 font-bold">稼働中</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-amber-600">{stats.planning}</p>
              <p className="text-[10px] text-amber-500 font-bold">企画中</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-slate-500">{stats.hold}</p>
              <p className="text-[10px] text-slate-400 font-bold">保留</p>
            </div>
          </div>

          <nav className="space-y-5">
            {/* プロジェクト */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Projects</p>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setSelectedProjectId('all'); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${selectedProjectId === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  すべて
                </button>
                {projects.map(project => (
                  <button
                    key={project?.id}
                    onClick={() => { setSelectedProjectId(project?.id || 'all'); setSidebarOpen(false) }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${selectedProjectId === project?.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Folder className="h-4 w-4" />
                    <span className="truncate">{project?.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* カテゴリ */}
            {categories.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Categories</p>
                <div className="space-y-0.5">
                  <button
                    onClick={() => { setSelectedCategoryId('all'); setSidebarOpen(false) }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${selectedCategoryId === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Tag className="h-4 w-4" />
                    すべて
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat?.id}
                      onClick={() => { setSelectedCategoryId(cat?.id || 'all'); setSidebarOpen(false) }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${selectedCategoryId === cat?.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat?.color || '#94a3b8' }} />
                      <span className="truncate">{cat?.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* アクション */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Actions</p>
              <div className="space-y-0.5">
                <Link href="/apps/new" onClick={() => setSidebarOpen(false)}>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-all">
                    <Plus className="h-4 w-4 text-indigo-500" />
                    アプリを追加
                  </button>
                </Link>
                <Link href="/import" onClick={() => setSidebarOpen(false)}>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-all">
                    <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-slate-400">
                      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                    </svg>
                    Vercel同期
                  </button>
                </Link>
                <Link href="/tools" onClick={() => setSidebarOpen(false)}>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-all">
                    <Wrench className="h-4 w-4 text-slate-400" />
                    開発ツール
                  </button>
                </Link>
                <Link href="/projects" onClick={() => setSidebarOpen(false)}>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-all">
                    <Folder className="h-4 w-4 text-slate-400" />
                    プロジェクト管理
                  </button>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="hidden sm:flex bg-white/70 backdrop-blur-xl border-b border-slate-200 px-6 py-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="アプリ名・タグ・説明で検索..."
              className="pl-10 bg-slate-100/50 border-none focus-visible:ring-indigo-500 h-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{ elements: { avatarBox: 'w-9 h-9 border border-slate-200 shadow-sm' } }}
            />
          </div>
        </header>

        {/* モバイル検索 */}
        <div className="sm:hidden px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="検索..."
              className="pl-10 bg-white border-slate-200 h-10 rounded-xl text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-[#f8fafc] custom-scrollbar">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {selectedProjectId !== 'all'
                  ? projects.find(p => p?.id === selectedProjectId)?.name
                  : selectedCategoryId !== 'all'
                    ? categories.find(c => c?.id === selectedCategoryId)?.name
                    : 'Your Applications'}
              </h2>
              <p className="text-sm text-slate-500">
                {sortedApps.length} 件
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortType)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white"
              >
                <option value="name">名前順</option>
                <option value="created">新しい順</option>
                <option value="status">ステータス順</option>
              </select>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 ml-1 relative flex-shrink-0">
                <button
                  onClick={() => setShowPropertiesMenu(!showPropertiesMenu)}
                  className={`p-1.5 rounded-md transition-colors ${showPropertiesMenu ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  title="表示項目の設定"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                </button>
                {/* Properties Dropdown */}
                {showPropertiesMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-slate-200 z-50 p-2 flex flex-col gap-1">
                    <div className="text-xs font-bold text-slate-400 px-2 py-1 mb-1">表示する項目</div>
                    {Object.entries({
                      icon: 'アイコン', status: 'ステータス', category: 'カテゴリ',
                      project: 'プロジェクト', tags: 'タグ', notes: 'メモ',
                      tasks: 'タスク進捗', url: 'URLリンク'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                          checked={visibleProps[key as keyof typeof visibleProps]}
                          onChange={(e) => setVisibleProps(prev => ({ ...prev, [key]: e.target.checked }))}
                        />
                        <span className="text-sm text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                )}
                <div className="w-px h-4 bg-slate-200 mx-0.5" />
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  title="カードビュー"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  title="リストビュー"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex gap-1 p-1 bg-slate-200/50 rounded-xl overflow-x-auto no-scrollbar w-full sm:w-auto">
              {(['全て', '採用', '企画中', '保留', '除外'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${statusFilter === status
                    ? status === '企画中' ? 'bg-white text-amber-600 shadow-sm'
                      : status === '除外' ? 'bg-white text-red-500 shadow-sm'
                        : 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {status === '企画中' ? '💡企画' : status}
                </button>
              ))}
            </div>
          </div>

          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5" : "flex flex-col gap-3"}>
            {sortedApps.map(app => (
              viewMode === 'grid' ? (
                <Card key={app.id} className="group border-none shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 bg-white rounded-2xl overflow-hidden ring-1 ring-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {visibleProps.icon && (
                          <div className="text-2xl w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300">
                            {app.icon || '📱'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          {/* 表示名（クリックでインライン編集） */}
                          {editingDisplayName === app.id ? (
                            <div className="flex gap-1">
                              <input
                                autoFocus
                                className="text-sm font-bold text-slate-900 border border-indigo-300 rounded-lg px-2 py-0.5 w-full outline-none focus:ring-1 focus:ring-indigo-400"
                                value={tempDisplayName}
                                onChange={e => setTempDisplayName(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveDisplayName(app.id)
                                  if (e.key === 'Escape') setEditingDisplayName(null)
                                }}
                                onBlur={() => handleSaveDisplayName(app.id)}
                                placeholder="日本語名を入力..."
                              />
                            </div>
                          ) : (
                            <div className="group/name">
                              <button
                                onClick={() => { setEditingDisplayName(app.id); setTempDisplayName(app.display_name || '') }}
                                className="flex items-center gap-1 text-left w-full"
                              >
                                <CardTitle className="text-base font-bold text-slate-900 truncate tracking-tight">
                                  {app.display_name || app.name}
                                </CardTitle>
                                <Pencil className="h-3 w-3 text-slate-300 opacity-0 group-hover/name:opacity-100 transition-opacity flex-shrink-0" />
                              </button>
                            </div>
                          )}
                          {/* 元のアプリ名（常に小さく表示） */}
                          <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{app.name}</p>
                          {visibleProps.status && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const nextStatus: Record<string, string> = {
                                    '採用': '保留', '保留': '企画中', '企画中': '採用', '除外': '採用'
                                  }
                                  handleQuickStatus(app.id, nextStatus[app.status] || '採用')
                                }}
                                className="flex items-center gap-1 hover:bg-slate-100 rounded px-1 py-0.5 transition-colors"
                                title="クリックでステータス切替"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${app.status === '採用' ? 'bg-emerald-500'
                                  : app.status === '企画中' ? 'bg-amber-400'
                                    : app.status === '保留' ? 'bg-slate-400' : 'bg-red-400'
                                  }`} />
                                <span className="text-[11px] text-slate-500 font-medium">{app.status}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 pt-0">
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed min-h-[2rem]">
                      {app.description || '説明なし'}
                    </p>
                    {/* メモプレビュー */}
                    {visibleProps.notes && app.notes && (
                      <div className="mt-2 p-2 bg-amber-50/80 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-700 line-clamp-2 flex items-start gap-1">
                          <StickyNote className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {app.notes}
                        </p>
                      </div>
                    )}
                    {/* タスク進捗 */}
                    {visibleProps.tasks && app.app_tasks && app.app_tasks.length > 0 && (() => {
                      const total = app.app_tasks!.length
                      const done = app.app_tasks!.filter(t => t.completed).length
                      const pct = Math.round((done / total) * 100)
                      return (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {done}/{total} タスク完了
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })()}
                    {(visibleProps.category || visibleProps.project || visibleProps.tags) && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {visibleProps.category && app.categories && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: (app.categories.color || '#6366f1') + '15',
                              color: app.categories.color || '#6366f1'
                            }}>
                            <Tag className="h-2.5 w-2.5" />
                            {app.categories.name}
                          </span>
                        )}
                        {visibleProps.project && app.projects && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
                            <Folder className="h-2.5 w-2.5" />
                            {app.projects.name}
                          </span>
                        )}
                        {visibleProps.tags && app.tags?.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 pb-4 px-5 flex gap-2">
                    {visibleProps.url && app.url && (
                      <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 text-sm">
                          <ExternalLink className="h-3.5 w-3.5" />
                          開く
                        </Button>
                      </a>
                    )}
                    <Link href={`/apps/${app.id}`}>
                      <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50 hover:text-indigo-600 h-9 px-3">
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ) : (
                <div key={app.id} className="group bg-white rounded-xl ring-1 ring-slate-200 p-3 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {visibleProps.icon && (
                      <div className="text-xl w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300">
                        {app.icon || '📱'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        {editingDisplayName === app.id ? (
                          <div className="flex gap-1 w-full max-w-[200px]">
                            <input
                              autoFocus
                              className="text-sm font-bold text-slate-900 border border-indigo-300 rounded-lg px-2 py-0.5 w-full outline-none focus:ring-1 focus:ring-indigo-400"
                              value={tempDisplayName}
                              onChange={e => setTempDisplayName(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveDisplayName(app.id)
                                if (e.key === 'Escape') setEditingDisplayName(null)
                              }}
                              onBlur={() => handleSaveDisplayName(app.id)}
                              placeholder="日本語名..."
                            />
                          </div>
                        ) : (
                          <button onClick={() => { setEditingDisplayName(app.id); setTempDisplayName(app.display_name || '') }} className="group/name flex items-center gap-1 text-left min-w-0">
                            <span className="text-sm font-bold text-slate-900 truncate">{app.display_name || app.name}</span>
                            <Pencil className="h-3 w-3 text-slate-300 opacity-0 group-hover/name:opacity-100 transition-opacity flex-shrink-0" />
                          </button>
                        )}
                        {app.display_name && <span className="text-[10px] text-slate-400 font-mono truncate hidden sm:inline">{app.name}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {visibleProps.status && (
                          <button onClick={(e) => {
                            e.stopPropagation()
                            const nextStatus: Record<string, string> = { '採用': '保留', '保留': '企画中', '企画中': '採用', '除外': '採用' }
                            handleQuickStatus(app.id, nextStatus[app.status] || '採用')
                          }}
                            className="flex items-center gap-1 hover:bg-slate-100 rounded px-1 -ml-1 py-0.5 transition-colors" title="クリックでステータス切替">
                            <span className={`w-1.5 h-1.5 rounded-full ${app.status === '採用' ? 'bg-emerald-500' : app.status === '企画中' ? 'bg-amber-400' : app.status === '保留' ? 'bg-slate-400' : 'bg-red-400'}`} />
                            <span className="text-[11px] text-slate-500 font-medium">{app.status}</span>
                          </button>
                        )}

                        {visibleProps.category && app.categories && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: (app.categories.color || '#6366f1') + '15', color: app.categories.color || '#6366f1' }}>
                            <Tag className="h-2 w-2" />
                            {app.categories.name}
                          </span>
                        )}
                        {visibleProps.project && app.projects && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold hidden sm:inline-flex">
                            <Folder className="h-2 w-2" />
                            {app.projects.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side actions */}
                  <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto pl-12 sm:pl-0 justify-between sm:justify-end">
                    {/* Tasks */}
                    <div className="w-24 flex-shrink-0 hidden md:block">
                      {app.app_tasks && app.app_tasks.length > 0 ? (() => {
                        const total = app.app_tasks!.length
                        const done = app.app_tasks!.filter(t => t.completed).length
                        const pct = Math.round((done / total) * 100)
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5" />{done}/{total}</span>
                              <span className="text-[9px] text-slate-400 text-right">{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1"><div className={`h-1 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} /></div>
                          </div>
                        )
                      })() : <div className="text-[10px] text-slate-300">タスクなし</div>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {app.url && (
                        <a href={app.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-indigo-600 hover:bg-indigo-50">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Link href={`/apps/${app.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>

          {sortedApps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <Search className="h-7 w-7 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-900">アプリが見つかりません</h3>
              <p className="text-sm text-slate-500 mt-1">検索条件を変えてみてください</p>
              <Button variant="link" className="mt-3 text-indigo-600 font-bold text-sm" onClick={() => { setSearch(''); setStatusFilter('全て'); setSelectedProjectId('all'); setSelectedCategoryId('all') }}>
                リセットする
              </Button>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div >
  )
}
