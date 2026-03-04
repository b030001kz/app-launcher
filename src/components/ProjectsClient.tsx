'use client'

import { useState } from 'react'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, ArrowLeft, Folder, Pencil, LayoutGrid, List, Settings2 } from 'lucide-react'
import Link from 'next/link'

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectsClientProps {
    initialProjects: Project[]
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
    const [projects, setProjects] = useState<Project[]>(initialProjects)
    const [showForm, setShowForm] = useState(false)
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showPropertiesMenu, setShowPropertiesMenu] = useState(false)
    const [visibleProps, setVisibleProps] = useState({
        color: true,
        description: true,
        actions: true,
    })
    const [formData, setFormData] = useState({ name: '', description: '', color: '#6366f1' })

    const handleSave = async () => {
        if (!formData.name) return
        try {
            const method = editingProjectId ? 'PATCH' : 'POST'
            const body = editingProjectId ? { id: editingProjectId, ...formData } : formData
            const res = await fetch('/api/projects', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                const savedProject = await res.json()
                if (editingProjectId) {
                    setProjects(prev => prev.map(p => p.id === editingProjectId ? savedProject : p))
                } else {
                    setProjects(prev => [savedProject, ...prev])
                }
                setFormData({ name: '', description: '', color: '#6366f1' })
                setShowForm(false)
                setEditingProjectId(null)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const startEdit = (project: Project) => {
        setFormData({ name: project.name, description: project.description || '', color: project.color || '#6366f1' })
        setEditingProjectId(project.id)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingProjectId(null)
        setFormData({ name: '', description: '', color: '#6366f1' })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('このプロジェクトを削除しますか？紐づくアプリがある場合は注意してください。')) return
        try {
            await fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
            setProjects(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 pb-24 sm:pb-10">
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
                                <Folder className="h-6 w-6 text-indigo-600" />
                                プロジェクト
                            </h1>
                            <p className="text-sm text-slate-500">{projects.length} 個のプロジェクト</p>
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
                                        color: 'カラーラベル', description: '説明文', actions: '操作ボタン'
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
                                    handleCancel()
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
                            <CardTitle className="text-lg text-slate-800">{editingProjectId ? 'プロジェクトを編集' : '新しいプロジェクトを作成'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">プロジェクト名 *</label>
                                    <Input
                                        autoFocus
                                        placeholder="例: 会社会計システム"
                                        className="rounded-xl h-11"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">テーマカラー</label>
                                    <div className="flex gap-2 h-11">
                                        <input
                                            type="color"
                                            className="h-11 w-11 rounded-xl cursor-pointer border-0 p-0 shadow-sm"
                                            value={formData.color}
                                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        />
                                        <Input
                                            placeholder="#6366f1"
                                            className="rounded-xl h-11 flex-1 uppercase font-mono"
                                            value={formData.color}
                                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">説明・目的</label>
                                <Input
                                    placeholder="アプリ群をまとめるためのプロジェクトです..."
                                    className="rounded-xl h-11"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" className="rounded-xl" onClick={handleCancel}>キャンセル</Button>
                                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6" onClick={handleSave}>
                                    {editingProjectId ? '保存する' : '作成する'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* プロジェクト一覧 */}
                {projects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Folder className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">プロジェクトがまだありません</h3>
                        <p className="text-sm text-slate-500 mt-1">「追加」ボタンから新規プロジェクトを作成してください</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "flex flex-col gap-2"}>
                        {projects.map(project => (
                            <div key={project.id} className="relative group">
                                <div className={`flex items-center bg-white rounded-xl ring-1 ring-slate-200 hover:shadow-lg hover:ring-indigo-200 transition-all duration-200 ${viewMode === 'grid' ? 'gap-3 p-4' : 'gap-4 p-3 pr-20'}`}>
                                    {visibleProps.color ? (
                                        <div
                                            className={`${viewMode === 'grid' ? 'w-10 h-10' : 'w-8 h-8'} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                                            style={{ backgroundColor: `${project.color || '#6366f1'}20` }}
                                        >
                                            <Folder className="h-5 w-5" style={{ color: project.color || '#6366f1' }} />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-xl flex-shrink-0">
                                            <Folder className="h-5 w-5 text-slate-400" />
                                        </div>
                                    )}
                                    <div className={`min-w-0 flex-1 ${viewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4' : ''}`}>
                                        <p className="font-bold text-sm text-slate-900 truncate">{project.name}</p>
                                        {visibleProps.description && project.description && (
                                            <p className={`text-[11px] text-slate-400 truncate ${viewMode === 'list' ? 'sm:text-right' : ''}`}>{project.description}</p>
                                        )}
                                    </div>
                                </div>
                                {visibleProps.actions && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(project)}
                                            className="p-1.5 bg-white/80 backdrop-blur-sm hover:bg-slate-50 text-slate-500 rounded-lg shadow-sm ring-1 ring-slate-200 pointer-events-auto transition-colors"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="p-1.5 bg-white/80 backdrop-blur-sm hover:bg-red-50 text-red-400 rounded-lg shadow-sm ring-1 ring-slate-200 pointer-events-auto transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
