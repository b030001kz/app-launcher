'use client'

import { useState } from 'react'
import { Plus, LayoutGrid, Folder, Tag, Wrench, Menu, X } from 'lucide-react'
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
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()

    const currentProject = searchParams.get('project')
    const currentCategory = searchParams.get('category')

    // フィルターリンクをクリックしたときのハンドラー
    const handleFilterClick = (type: 'project' | 'category', id: string | null) => {
        setSidebarOpen(false)
        if (pathname !== '/') {
            // ダッシュボード外にいる場合はトップページに移動してからフィルタ
            if (id) {
                router.push(`/?${type}=${id}`)
            } else {
                router.push(`/`)
            }
        } else {
            // すでにダッシュボードにいる場合はクエリのみ更新
            const params = new URLSearchParams()
            if (id) {
                params.set(type, id)
            }
            router.push(`/?${params.toString()}`)
        }
    }

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
                <div className="w-9" /> {/* バランス用 */}
            </div>

            {/* サイドバー本体 */}
            <aside className={`
                fixed sm:static inset-y-0 left-0 z-[70] 
                w-72 sm:w-64 bg-white border-r border-slate-200 
                flex-shrink-0 flex flex-col h-screen
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
            `}>
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {/* モバイル用閉じるボタン */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="sm:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>

                    <div className="flex items-center justify-between mb-8 hidden sm:flex">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                                <span className="text-white text-sm font-bold">A</span>
                            </div>
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight">App Launcher</h1>
                        </div>
                        <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
                    </div>

                    {/* 統計 */}
                    <div className="grid grid-cols-2 gap-2 mb-8">
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

                    <nav className="space-y-6">
                        {/* プロジェクト */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Projects</p>
                            <div className="space-y-0.5">
                                <button
                                    onClick={() => handleFilterClick('project', null)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${(!currentProject && !currentCategory && pathname === '/') ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    すべて
                                </button>
                                {projects.map(project => (
                                    <button
                                        key={project.id}
                                        onClick={() => handleFilterClick('project', project.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${currentProject === project.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Folder className="h-4 w-4" />
                                        <span className="truncate">{project.name}</span>
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

                        {/* 管理メニュー */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Manage</p>
                            <div className="space-y-0.5">
                                <Link onClick={() => setSidebarOpen(false)} href="/projects" className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${pathname === '/projects' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    <Folder className="h-4 w-4" />
                                    プロジェクト設定
                                </Link>
                                <Link onClick={() => setSidebarOpen(false)} href="/tools" className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${pathname === '/tools' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    <Wrench className="h-4 w-4" />
                                    開発ツール設定
                                </Link>
                            </div>
                        </div>

                    </nav>
                </div>

                {/* 新規作成ボタン (最下部に固定) */}
                <div className="p-4 border-t border-slate-100">
                    <Link href="/apps/new" onClick={() => setSidebarOpen(false)}>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer">
                            <Plus className="h-4 w-4" />
                            アプリを登録
                        </button>
                    </Link>
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
