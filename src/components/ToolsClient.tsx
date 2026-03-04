'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ExternalLink, Trash2, ArrowLeft, Wrench, Pencil, LayoutGrid, List, Settings2 } from 'lucide-react'
import Link from 'next/link'

type DevTool = Database['public']['Tables']['dev_tools']['Row']

// よく使うカテゴリのプリセット
const CATEGORIES = ['ホスティング', 'データベース', '認証', 'デザイン', 'CI/CD', 'API', '分析', 'コミュニケーション', 'その他']

// カテゴリごとのデフォルトアイコン
const CATEGORY_ICONS: Record<string, string> = {
    'ホスティング': '🌐', 'データベース': '🗄️', '認証': '🔐', 'デザイン': '🎨',
    'CI/CD': '⚙️', 'API': '🔗', '分析': '📊', 'コミュニケーション': '💬', 'その他': '🔧'
}

interface ToolsClientProps {
    initialTools: DevTool[]
}

export default function ToolsClient({ initialTools }: ToolsClientProps) {
    const { isLoaded, isSignedIn } = useUser()
    const [tools, setTools] = useState<DevTool[]>(initialTools)
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingToolId, setEditingToolId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showPropertiesMenu, setShowPropertiesMenu] = useState(false)
    const [visibleProps, setVisibleProps] = useState({
        icon: true,
        description: true,
        actions: true,
    })
    const [formData, setFormData] = useState({ name: '', url: '', icon: '🔧', category: 'その他', description: '' })



    const handleSave = async () => {
        if (!formData.name || !formData.url) return
        try {
            const method = editingToolId ? 'PATCH' : 'POST'
            const body = editingToolId ? { id: editingToolId, ...formData } : formData
            const res = await fetch('/api/tools', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                const savedTool = await res.json()
                if (editingToolId) {
                    setTools(prev => prev.map(t => t.id === editingToolId ? savedTool : t))
                } else {
                    setTools(prev => [...prev, savedTool])
                }
                setFormData({ name: '', url: '', icon: '🔧', category: 'その他', description: '' })
                setShowForm(false)
                setEditingToolId(null)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const startEdit = (tool: DevTool) => {
        setFormData({ name: tool.name, url: tool.url, icon: tool.icon || '🔧', category: tool.category || 'その他', description: tool.description || '' })
        setEditingToolId(tool.id)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingToolId(null)
        setFormData({ name: '', url: '', icon: '🔧', category: 'その他', description: '' })
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
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 relative flex-shrink-0">
                            <button
                                onClick={() => setShowPropertiesMenu(!showPropertiesMenu)}
                                className={`p-1.5 rounded-md transition-colors ${showPropertiesMenu ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                title="表示項目の設定"
                            >
                                <Settings2 className="h-4 w-4" />
                            </button>
                            {/* Properties Dropdown */}
                            {showPropertiesMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-slate-200 z-50 p-2 flex flex-col gap-1">
                                    <div className="text-xs font-bold text-slate-400 px-2 py-1 mb-1">表示する項目</div>
                                    {Object.entries({
                                        icon: 'アイコン', description: '説明文', actions: '操作ボタン'
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
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                title="リストビュー"
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                        <Button
                            onClick={() => {
                                setShowForm(!showForm);
                                if (showForm) {
                                    setEditingToolId(null)
                                    setFormData({ name: '', url: '', icon: '🔧', category: 'その他', description: '' })
                                }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 h-10 px-4"
                        >
                            <Plus className="h-4 w-4" />
                            追加
                        </Button>
                    </div>
                </div>

                {/* 追加/編集フォーム */}
                {showForm && (
                    <Card className="mb-6 border-none shadow-md ring-1 ring-slate-200 rounded-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg text-slate-800">{editingToolId ? '開発ツールを編集' : '新しいツールを追加'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" className="rounded-xl" onClick={handleCancel}>キャンセル</Button>
                                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6" onClick={handleSave}>
                                    {editingToolId ? '保存する' : '追加する'}
                                </Button>
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
                                <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "flex flex-col gap-2"}>
                                    {categoryTools.map(tool => (
                                        <div key={tool.id} className="relative group">
                                            <a
                                                href={tool.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center bg-white rounded-xl ring-1 ring-slate-200 hover:shadow-lg hover:ring-indigo-200 transition-all duration-200 pr-20 ${viewMode === 'grid' ? 'gap-3 p-4' : 'gap-4 p-3 sm:pr-24'}`}
                                            >
                                                {visibleProps.icon && (
                                                    <span className={`${viewMode === 'grid' ? 'text-2xl w-10 h-10' : 'text-xl w-8 h-8'} bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                                                        {tool.icon}
                                                    </span>
                                                )}
                                                <div className={`min-w-0 flex-1 ${viewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4' : ''}`}>
                                                    <p className="font-bold text-sm text-slate-900 truncate">{tool.name}</p>
                                                    {visibleProps.description && tool.description && (
                                                        <p className={`text-[11px] text-slate-400 truncate ${viewMode === 'list' ? 'sm:text-right' : ''}`}>{tool.description}</p>
                                                    )}
                                                </div>
                                            </a>
                                            {visibleProps.actions && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(tool) }}
                                                        className="p-1.5 bg-white/80 backdrop-blur-sm hover:bg-slate-50 text-slate-500 rounded-lg shadow-sm ring-1 ring-slate-200 pointer-events-auto transition-colors"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(tool.id) }}
                                                        className="p-1.5 bg-white/80 backdrop-blur-sm hover:bg-red-50 text-red-400 rounded-lg shadow-sm ring-1 ring-slate-200 pointer-events-auto transition-colors"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
