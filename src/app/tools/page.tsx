'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ExternalLink, Trash2, ArrowLeft, Wrench } from 'lucide-react'
import Link from 'next/link'

type DevTool = Database['public']['Tables']['dev_tools']['Row']

// よく使うカテゴリのプリセット
const CATEGORIES = ['ホスティング', 'データベース', '認証', 'デザイン', 'CI/CD', 'API', '分析', 'コミュニケーション', 'その他']

// カテゴリごとのデフォルトアイコン
const CATEGORY_ICONS: Record<string, string> = {
    'ホスティング': '🌐', 'データベース': '🗄️', '認証': '🔐', 'デザイン': '🎨',
    'CI/CD': '⚙️', 'API': '🔗', '分析': '📊', 'コミュニケーション': '💬', 'その他': '🔧'
}

export default function ToolsPage() {
    const { isLoaded, isSignedIn } = useUser()
    const [tools, setTools] = useState<DevTool[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ name: '', url: '', icon: '🔧', category: 'その他', description: '' })

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return
        fetchTools()
    }, [isLoaded, isSignedIn])

    const fetchTools = async () => {
        try {
            const res = await fetch('/api/tools')
            if (res.ok) setTools(await res.json())
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        if (!formData.name || !formData.url) return
        try {
            const res = await fetch('/api/tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                const newTool = await res.json()
                setTools(prev => [...prev, newTool])
                setFormData({ name: '', url: '', icon: '🔧', category: 'その他', description: '' })
                setShowForm(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('このツールを削除しますか？')) return
        try {
            await fetch(`/api/tools?id=${id}`, { method: 'DELETE' })
            setTools(prev => prev.filter(t => t.id !== id))
        } catch (err) {
            console.error(err)
        }
    }

    // カテゴリ別にグルーピング
    const grouped = tools.reduce((acc, tool) => {
        const cat = tool.category || 'その他'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(tool)
        return acc
    }, {} as Record<string, DevTool[]>)

    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <p className="text-slate-400 animate-pulse">Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <ArrowLeft className="h-5 w-5 text-slate-600" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Wrench className="h-6 w-6 text-indigo-600" />
                                開発ツール
                            </h1>
                            <p className="text-sm text-slate-500">{tools.length} 個のツール・サービスを管理中</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        追加
                    </Button>
                </div>

                {/* 追加フォーム */}
                {showForm && (
                    <Card className="mb-6 border-none shadow-md ring-1 ring-slate-200 rounded-2xl">
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">サービス名 *</label>
                                    <Input
                                        placeholder="例: Vercel"
                                        className="rounded-xl h-11"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">URL *</label>
                                    <Input
                                        placeholder="https://vercel.com"
                                        className="rounded-xl h-11"
                                        value={formData.url}
                                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">アイコン</label>
                                    <Input
                                        placeholder="🔧"
                                        className="rounded-xl h-11 text-2xl text-center"
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">カテゴリ</label>
                                    <select
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value, icon: CATEGORY_ICONS[e.target.value] || formData.icon })}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">メモ</label>
                                    <Input
                                        placeholder="用途など"
                                        className="rounded-xl h-11"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>キャンセル</Button>
                                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAdd}>追加する</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* カテゴリ別表示 */}
                {Object.keys(grouped).length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Wrench className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">ツールがまだありません</h3>
                        <p className="text-sm text-slate-500 mt-1">「追加」ボタンから開発ツールを登録してください</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([category, categoryTools]) => (
                            <div key={category}>
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span>{CATEGORY_ICONS[category] || '📦'}</span>
                                    {category}
                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{categoryTools.length}</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {categoryTools.map(tool => (
                                        <a
                                            key={tool.id}
                                            href={tool.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 p-4 bg-white rounded-xl ring-1 ring-slate-200 hover:shadow-lg hover:ring-indigo-200 transition-all duration-200"
                                        >
                                            <span className="text-2xl w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                {tool.icon}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-sm text-slate-900 truncate">{tool.name}</p>
                                                {tool.description && (
                                                    <p className="text-[11px] text-slate-400 truncate">{tool.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(tool.id) }}
                                                    className="p-1 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                                </button>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
