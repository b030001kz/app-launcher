'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Folder, Pencil, LayoutGrid, List, CheckCircle2, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectMeta {
    taskTotal: number
    taskDone: number
    appCount: number
}

const STATUS_COLOR: Record<string, string> = {
    '計画中': 'bg-amber-100 text-amber-700',
    '進行中': 'bg-blue-100 text-blue-700',
    '完了': 'bg-emerald-100 text-emerald-700',
    '保留': 'bg-slate-100 text-slate-600',
}

export default function ProjectsClient() {
    const [projects, setProjects] = useState<Project[]>([])
    const [projectMeta, setProjectMeta] = useState<Record<string, ProjectMeta>>({})
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [formData, setFormData] = useState({ name: '', description: '', color: '#6366f1' })

    // クライアントサイドでデータ取得
    useEffect(() => {
        fetch('/api/projects')
            .then(r => r.json())
            .then((data: any) => {
                if (data.projects) {
                    setProjects(data.projects)
                    setProjectMeta(data.meta || {})
                } else if (Array.isArray(data)) {
                    setProjects(data)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])


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

    const startEdit = (e: React.MouseEvent, project: Project) => {
        e.preventDefault()
        e.stopPropagation()
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

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm('このプロジェクトを削除しますか？')) return
        try {
            await fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
            setProjects(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="flex flex-col h-full w-full">
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc] custom-scrollbar">
                {/* ヘッダー */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Folder className="h-6 w-6 text-indigo-600" />
                            プロジェクト
                        </h1>
                        <p className="text-sm text-slate-500">{projects.length} 個のプロジェクト</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 relative flex-shrink-0">
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
                                if (showForm) handleCancel()
                                else setShowForm(true)
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
                                <label className="text-sm font-bold text-slate-700">説明</label>
                                <Input
                                    placeholder="プロジェクトの概要..."
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
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                        {projects.map(project => {
                            const meta = projectMeta[project.id] || { taskTotal: 0, taskDone: 0, appCount: 0 }
                            const pct = meta.taskTotal > 0 ? Math.round((meta.taskDone / meta.taskTotal) * 100) : 0
                            const daysLeft = project.due_date
                                ? Math.ceil((new Date(project.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                : null

                            return viewMode === 'grid' ? (
                                <Link key={project.id} href={`/projects/${project.id}`}>
                                    <div className="relative group bg-white rounded-2xl ring-1 ring-slate-200 hover:shadow-xl hover:ring-indigo-200 transition-all duration-300 p-5 cursor-pointer h-full">
                                        {/* ステータスバッジ */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                                                style={{ backgroundColor: `${project.color || '#6366f1'}20` }}
                                            >
                                                <Folder className="h-5 w-5" style={{ color: project.color || '#6366f1' }} />
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[project.status || '計画中'] || 'bg-slate-100 text-slate-600'}`}>
                                                {project.status || '計画中'}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 truncate mb-1">{project.name}</h3>
                                        {project.description && (
                                            <p className="text-xs text-slate-400 line-clamp-2 mb-3">{project.description}</p>
                                        )}

                                        {/* メタ情報 */}
                                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-auto pt-3 border-t border-slate-100">
                                            <span className="flex items-center gap-1">📱 {meta.appCount}個</span>
                                            {meta.taskTotal > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> {meta.taskDone}/{meta.taskTotal}
                                                </span>
                                            )}
                                            {daysLeft !== null && (
                                                <span className={`flex items-center gap-1 ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-600' : ''}`}>
                                                    <Calendar className="h-3 w-3" />
                                                    {daysLeft < 0 ? `${Math.abs(daysLeft)}日超過` : `残${daysLeft}日`}
                                                </span>
                                            )}
                                        </div>

                                        {/* タスク進捗バー */}
                                        {meta.taskTotal > 0 && (
                                            <div className="mt-2 w-full bg-slate-100 rounded-full h-1">
                                                <div
                                                    className={`h-1 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        )}

                                        {/* ホバー時の操作ボタン */}
                                        <div className="absolute top-3 right-12 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => startEdit(e, project)}
                                                className="p-1.5 bg-white/80 backdrop-blur-sm hover:bg-slate-50 text-slate-500 rounded-lg shadow-sm ring-1 ring-slate-200"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, project.id)}
                                                className="p-1.5 bg-white/80 backdrop-blur-sm hover:bg-red-50 text-red-400 rounded-lg shadow-sm ring-1 ring-slate-200"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <Link key={project.id} href={`/projects/${project.id}`}>
                                    <div className="relative group bg-white rounded-xl ring-1 ring-slate-200 hover:shadow-md transition-all p-3 pr-20 flex items-center gap-3 cursor-pointer">
                                        <div
                                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: `${project.color || '#6366f1'}20` }}
                                        >
                                            <Folder className="h-4 w-4" style={{ color: project.color || '#6366f1' }} />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="font-bold text-sm text-slate-900 truncate">{project.name}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLOR[project.status || '計画中'] || 'bg-slate-100 text-slate-600'}`}>
                                                    {project.status || '計画中'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                                <span>📱 {meta.appCount}</span>
                                                {meta.taskTotal > 0 && <span>{meta.taskDone}/{meta.taskTotal} タスク</span>}
                                                {daysLeft !== null && (
                                                    <span className={daysLeft < 0 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-600' : ''}>
                                                        {daysLeft < 0 ? `${Math.abs(daysLeft)}日超過` : `残${daysLeft}日`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => startEdit(e, project)} className="p-1.5 bg-white/80 hover:bg-slate-50 text-slate-500 rounded-lg shadow-sm ring-1 ring-slate-200">
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                            <button onClick={(e) => handleDelete(e, project.id)} className="p-1.5 bg-white/80 hover:bg-red-50 text-red-400 rounded-lg shadow-sm ring-1 ring-slate-200">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
