'use client'

import { useState, useEffect } from 'react'
import { Plus, LayoutGrid, Folder, Tag, Wrench, Menu, X, Home, ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

interface SidebarData {
    projects: any[]
    categories: any[]
    stats: { total: number; active: number; planning: number; hold: number }
}

export default function SidebarClient() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [data, setData] = useState<SidebarData | null>(null)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()

    const currentProject = searchParams.get('project')
    const currentCategory = searchParams.get('category')

    // 初回のみデータ取得
    useEffect(() => {
        fetch('/api/sidebar')
            .then(r => r.json())
            .then(d => setData(d))
            .catch(err => console.error('Sidebar fetch error:', err))
    }, [])

    // 折りたたみ状態をlocalStorageから復元
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed')
        if (saved === 'true') setCollapsed(true)
    }, [])

    const toggleCollapse = () => {
        const next = !collapsed
        setCollapsed(next)
        localStorage.setItem('sidebar-collapsed', String(next))
    }

    const handleFilterClick = (type: 'project' | 'category', id: string | null) => {
        setSidebarOpen(false)
        if (pathname !== '/') {
            router.push(id ? `/?${type}=${id}` : `/`)
        } else {
            const params = new URLSearchParams()
            if (id) params.set(type, id)
            router.push(`/?${params.toString()}`)
        }
    }

    const stats = data?.stats || { total: 0, active: 0, planning: 0, hold: 0 }
    const projects = data?.projects || []
    const categories = data?.categories || []

    const navLinks = [
        { href: '/', icon: Home, label: '\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9', active: pathname === '/' && !currentProject && !currentCategory },
        { href: '/projects', icon: Folder, label: '\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u7ba1\u7406', active: pathname === '/projects' || pathname.startsWith('/projects/') },
        { href: '/tools', icon: Wrench, label: '\u958b\u767a\u30c4\u30fc\u30eb', active: pathname === '/tools' },
        { href: '/import', icon: Upload, label: 'Vercel\u540c\u671f', active: pathname === '/import' },
    ]

    return (
        <>
            {/* モバイルヘッダー */}
            <div className="sm:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-[60] border-b border-slate-200 px-4 flex items-center justify-between">
                <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px]">A</span>
                    App Launcher
                </div>
                <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
            </div>

            {/* サイドバー */}
            <aside className={`
                fixed sm:static inset-y-0 left-0 z-[70] 
                ${collapsed ? 'sm:w-[68px]' : 'sm:w-64'} w-72
                bg-white border-r border-slate-200 
                flex-shrink-0 flex flex-col h-screen
                transition-all duration-200 ease-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
            `}>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <button onClick={() => setSidebarOpen(false)} className="sm:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>

                    {/* ロゴ */}
                    <div className={`hidden sm:flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-6`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                                <span className="text-white text-sm font-bold">A</span>
                            </div>
                            {!collapsed && <h1 className="text-lg font-bold text-slate-800 tracking-tight">App Launcher</h1>}
                        </div>
                        {!collapsed && <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />}
                    </div>

                    {/* 統計 */}
                    {!collapsed && (
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            <div className="bg-slate-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-slate-800">{stats.total}</p><p className="text-[10px] text-slate-400 font-bold">{'\u5408\u8a08'}</p></div>
                            <div className="bg-emerald-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-emerald-600">{stats.active}</p><p className="text-[10px] text-emerald-500 font-bold">{'\u7a3c\u50cd\u4e2d'}</p></div>
                            <div className="bg-amber-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-amber-600">{stats.planning}</p><p className="text-[10px] text-amber-500 font-bold">{'\u4f01\u753b\u4e2d'}</p></div>
                            <div className="bg-slate-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-slate-500">{stats.hold}</p><p className="text-[10px] text-slate-400 font-bold">{'\u4fdd\u7559'}</p></div>
                        </div>
                    )}
                    {collapsed && (
                        <div className="hidden sm:flex flex-col items-center gap-1 mb-4">
                            <div className="text-xs font-bold text-slate-800">{stats.total}</div>
                            <div className="text-[9px] text-slate-400">{'\u30a2\u30d7\u30ea'}</div>
                        </div>
                    )}

                    <nav className="space-y-5">
                        <div>
                            {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Navigate</p>}
                            <div className="space-y-0.5">
                                {navLinks.map(item => (
                                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${collapsed ? 'justify-center' : ''} ${item.active ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon className="h-4 w-4 flex-shrink-0" />
                                        {!collapsed && <span className="truncate">{item.label}</span>}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {projects.length > 0 && (
                            <div>
                                {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Projects</p>}
                                <div className="space-y-0.5">
                                    <button onClick={() => handleFilterClick('project', null)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${collapsed ? 'justify-center' : ''} ${(!currentProject && !currentCategory && pathname === '/') ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                        title={collapsed ? '\u3059\u3079\u3066' : undefined}
                                    >
                                        <LayoutGrid className="h-4 w-4 flex-shrink-0" />
                                        {!collapsed && '\u3059\u3079\u3066'}
                                    </button>
                                    {projects.map((project: any) => (
                                        <button key={project.id} onClick={() => handleFilterClick('project', project.id)}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${collapsed ? 'justify-center' : ''} ${currentProject === project.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                            title={collapsed ? project.name : undefined}
                                        >
                                            <Folder className="h-4 w-4 flex-shrink-0" />
                                            {!collapsed && <span className="truncate">{project.name}</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!collapsed && categories.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Categories</p>
                                <div className="space-y-0.5">
                                    <button onClick={() => handleFilterClick('category', null)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${currentCategory === null && currentProject === null && pathname === '/' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Tag className="h-4 w-4" /> {'\u3059\u3079\u3066'}
                                    </button>
                                    {categories.map((cat: any) => (
                                        <button key={cat.id} onClick={() => handleFilterClick('category', cat.id)}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${currentCategory === cat.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
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

                <div className="border-t border-slate-100 p-3 space-y-2">
                    <Link href="/apps/new" onClick={() => setSidebarOpen(false)}>
                        <button className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-2'} px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-colors cursor-pointer`}>
                            <Plus className="h-4 w-4" />
                            {!collapsed && '\u30a2\u30d7\u30ea\u3092\u767b\u9332'}
                        </button>
                    </Link>
                    <button onClick={toggleCollapse}
                        className="hidden sm:flex w-full items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg text-xs transition-colors"
                        title={collapsed ? '\u30b5\u30a4\u30c9\u30d0\u30fc\u3092\u5c55\u958b' : '\u30b5\u30a4\u30c9\u30d0\u30fc\u3092\u6298\u308a\u305f\u305f\u3080'}
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>{'\u6298\u308a\u305f\u305f\u3080'}</span></>}
                    </button>
                </div>
            </aside>

            {sidebarOpen && (
                <div className="sm:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[65]" onClick={() => setSidebarOpen(false)} />
            )}
        </>
    )
}
