'use client'

import { useState, useEffect } from 'react'
import { Plus, LayoutGrid, Folder, Tag, Wrench, Menu, X, Home, ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

interface SidebarClientProps {
    projects: any[]
    categories: any[]
    stats: {
        total: number
        active: number
        planning: number
        hold: number
    }
}

export default function SidebarClient({ projects, categories, stats }: SidebarClientProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()

    const currentProject = searchParams.get('project')
    const currentCategory = searchParams.get('category')

    // 折りたたみ状態をlocalStorageから復元
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed')
        if (saved === 'true') setCollapsed(true)
    }, [])

    // 折りたたみ状態を保存
    const toggleCollapse = () => {
        const next = !collapsed
        setCollapsed(next)
        localStorage.setItem('sidebar-collapsed', String(next))
    }

    // フィルターリンクをクリックしたときのハンドラー
    const handleFilterClick = (type: 'project' | 'category', id: string | null) => {
        setSidebarOpen(false)
        if (pathname !== '/') {
            if (id) {
                router.push(`/?${type}=${id}`)
            } else {
                router.push(`/`)
            }
        } else {
            const params = new URLSearchParams()
            if (id) {
                params.set(type, id)
            }
            router.push(`/?${params.toString()}`)
        }
    }

    // ナビゲーションアイテム
    const navLinks = [
        { href: '/', icon: Home, label: 'ダッシュボード', active: pathname === '/' && !currentProject && !currentCategory },
        { href: '/projects', icon: Folder, label: 'プロジェクト管理', active: pathname === '/projects' || pathname.startsWith('/projects/') },
        { href: '/tools', icon: Wrench, label: '開発ツール', active: pathname === '/tools' },
        { href: '/import', icon: Upload, label: 'Vercel同期', active: pathname === '/import' },
    ]

    return (
        <>
            {/* モバイル用開閉ボタン＆ヘッダー */}
            <div className="sm:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-[60] border-b border-slate-200 px-4 flex items-center justify-between">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px]">A</span>
                    App Launcher
                </div>
                <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
            </div>

            {/* サイドバー本体 */}
            <aside className={`
                fixed sm:static inset-y-0 left-0 z-[70] 
                ${collapsed ? 'sm:w-[68px]' : 'sm:w-64'} w-72
                bg-white border-r border-slate-200 
                flex-shrink-0 flex flex-col h-screen
                transition-all duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
            `}>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {/* モバイル用閉じるボタン */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="sm:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>

                    {/* ロゴ・ユーザー */}
                    <div className={`hidden sm:flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-6`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                                <span className="text-white text-sm font-bold">A</span>
                            </div>
                            {!collapsed && <h1 className="text-lg font-bold text-slate-800 tracking-tight">App Launcher</h1>}
                        </div>
                        {!collapsed && <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />}
                    </div>

                    {/* 統計（展開時のみ） */}
                    {!collapsed && (
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                                <p className="text-lg font-bold text-slate-800">{stats.total}</p>
                                <p className="text-[10px] text-slate-400 font-bold">合計</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                                <p className="text-lg font-bold text-emerald-600">{stats.active}</p>
                                <p className="text-[10px] text-emerald-500 font-bold">稼働中</p>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                                <p className="text-lg font-bold text-amber-600">{stats.planning}</p>
                                <p className="text-[10px] text-amber-500 font-bold">企画中</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                                <p className="text-lg font-bold text-slate-500">{stats.hold}</p>
                                <p className="text-[10px] text-slate-400 font-bold">保留</p>
                            </div>
                        </div>
                    )}

                    {/* 折りたたみ時のミニ統計 */}
                    {collapsed && (
                        <div className="hidden sm:flex flex-col items-center gap-1 mb-4">
                            <div className="text-xs font-bold text-slate-800">{stats.total}</div>
                            <div className="text-[9px] text-slate-400">アプリ</div>
                        </div>
                    )}

                    <nav className="space-y-5">
                        {/* ナビゲーションリンク */}
                        <div>
                            {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Navigate</p>}
                            <div className="space-y-0.5">
                                {navLinks.map(item => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${collapsed ? 'justify-center' : ''} ${item.active ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon className="h-4 w-4 flex-shrink-0" />
                                        {!collapsed && <span className="truncate">{item.label}</span>}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* プロジェクトフィルター */}
                        {projects.length > 0 && (
                            <div>
                                {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Projects</p>}
                                <div className="space-y-0.5">
                                    <button
                                        onClick={() => handleFilterClick('project', null)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${collapsed ? 'justify-center' : ''} ${(!currentProject && !currentCategory && pathname === '/') ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                        title={collapsed ? 'すべて' : undefined}
                                    >
                                        <LayoutGrid className="h-4 w-4 flex-shrink-0" />
                                        {!collapsed && 'すべて'}
                                    </button>
                                    {projects.map(project => (
                                        <button
                                            key={project.id}
                                            onClick={() => handleFilterClick('project', project.id)}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${collapsed ? 'justify-center' : ''} ${currentProject === project.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                            title={collapsed ? project.name : undefined}
                                        >
                                            <Folder className="h-4 w-4 flex-shrink-0" />
                                            {!collapsed && <span className="truncate">{project.name}</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* カテゴリフィルター */}
                        {!collapsed && categories.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Categories</p>
                                <div className="space-y-0.5">
                                    <button
                                        onClick={() => handleFilterClick('category', null)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${currentCategory === null && currentProject === null && pathname === '/' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Tag className="h-4 w-4" />
                                        すべて
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleFilterClick('category', cat.id)}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${currentCategory === cat.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#94a3b8' }} />
                                            <span className="truncate">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </nav>
                </div>

                {/* 下部ボタン群 */}
                <div className="border-t border-slate-100 p-3 space-y-2">
                    {/* 新規登録ボタン */}
                    <Link href="/apps/new" onClick={() => setSidebarOpen(false)}>
                        <button className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-2'} px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer`}>
                            <Plus className="h-4 w-4" />
                            {!collapsed && 'アプリを登録'}
                        </button>
                    </Link>

                    {/* 折りたたみトグル（デスクトップのみ） */}
                    <button
                        onClick={toggleCollapse}
                        className="hidden sm:flex w-full items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg text-xs transition-colors"
                        title={collapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>折りたたむ</span></>}
                    </button>
                </div>
            </aside>

            {/* モバイル用オーバーレイ */}
            {sidebarOpen && (
                <div
                    className="sm:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[65]"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    )
}
