'use client'

import { useState } from 'react'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    ArrowLeft, Folder, Plus, Trash2, CheckCircle2, Circle,
    ExternalLink, Settings, Calendar, Target, StickyNote, Pencil
} from 'lucide-react'
import Link from 'next/link'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectTask = Database['public']['Tables']['project_tasks']['Row']
type LinkedApp = {
    id: string
    name: string
    display_name: string | null
    icon: string | null
    status: string
    url: string
}

interface ProjectDetailClientProps {
    initialProject: Project
    initialTasks: ProjectTask[]
    initialApps: LinkedApp[]
}

const STATUS_OPTIONS = ['計画中', '進行中', '完了', '保留'] as const

export default function ProjectDetailClient({ initialProject, initialTasks, initialApps }: ProjectDetailClientProps) {
    const [project, setProject] = useState<Project>(initialProject)
    const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks)
    const [apps] = useState<LinkedApp[]>(initialApps)
    const [newTaskTitle, setNewTaskTitle] = useState('')

    // インライン編集用
    const [editingField, setEditingField] = useState<string | null>(null)
    const [tempValue, setTempValue] = useState('')

    // プロジェクト情報の更新
    const updateProject = async (updates: Partial<Project>) => {
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            if (res.ok) {
                const updated = await res.json()
                setProject(updated)
            }
        } catch (err) {
            console.error('Failed to update project:', err)
        }
    }

    // フィールドの保存
    const saveField = (field: string) => {
        updateProject({ [field]: tempValue || null })
        setEditingField(null)
    }

    // タスク追加
    const addTask = async () => {
        if (!newTaskTitle.trim()) return
        try {
            const res = await fetch('/api/project-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: project.id, title: newTaskTitle, sort_order: tasks.length })
            })
            if (res.ok) {
                const task = await res.json()
                setTasks(prev => [...prev, task])
                setNewTaskTitle('')
            }
        } catch (err) {
            console.error('Failed to add task:', err)
        }
    }

    // タスク完了トグル
    const toggleTask = async (taskId: string, completed: boolean) => {
        try {
            await fetch('/api/project-tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, completed: !completed })
            })
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t))
        } catch (err) {
            console.error('Failed to toggle task:', err)
        }
    }

    // タスク削除
    const deleteTask = async (taskId: string) => {
        try {
            await fetch(`/api/project-tasks?id=${taskId}`, { method: 'DELETE' })
            setTasks(prev => prev.filter(t => t.id !== taskId))
        } catch (err) {
            console.error('Failed to delete task:', err)
        }
    }

    // 統計
    const completedTasks = tasks.filter(t => t.completed).length
    const totalTasks = tasks.length
    const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // 期限までの残り日数
    const daysLeft = project.due_date
        ? Math.ceil((new Date(project.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null

    const statusColor: Record<string, string> = {
        '計画中': 'bg-amber-100 text-amber-700',
        '進行中': 'bg-blue-100 text-blue-700',
        '完了': 'bg-emerald-100 text-emerald-700',
        '保留': 'bg-slate-100 text-slate-600',
    }

    return (
        <div className="flex flex-col h-full w-full">
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#f8fafc] custom-scrollbar">
                {/* ヘッダー */}
                <div className="flex items-start gap-3">
                    <Link href="/projects">
                        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors mt-1">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                                style={{ backgroundColor: `${project.color || '#6366f1'}20` }}
                            >
                                <Folder className="h-5 w-5" style={{ color: project.color || '#6366f1' }} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 truncate">{project.name}</h1>
                            {/* ステータスバッジ */}
                            <select
                                value={project.status || '計画中'}
                                onChange={e => updateProject({ status: e.target.value })}
                                className={`text-xs font-bold px-3 py-1 rounded-full border-0 cursor-pointer ${statusColor[project.status || '計画中'] || 'bg-slate-100 text-slate-600'}`}
                            >
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {project.description && (
                            <p className="text-sm text-slate-500 mt-1 ml-[52px]">{project.description}</p>
                        )}
                    </div>
                </div>

                {/* 進捗バー */}
                {totalTasks > 0 && (
                    <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                                進捗: {completedTasks}/{totalTasks} タスク完了
                            </span>
                            <span className="text-sm font-bold text-slate-500">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* メタ情報カード（ゴール・期限） */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* ゴール */}
                    <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5" /> ゴール
                            </span>
                            <button
                                onClick={() => { setEditingField('goal'); setTempValue(project.goal || '') }}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                                <Pencil className="h-3 w-3" />
                            </button>
                        </div>
                        {editingField === 'goal' ? (
                            <div className="space-y-2">
                                <textarea
                                    autoFocus
                                    className="w-full text-sm border border-indigo-300 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                                    rows={3}
                                    value={tempValue}
                                    onChange={e => setTempValue(e.target.value)}
                                    placeholder="このプロジェクトの完成形を記入..."
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="outline" className="rounded-lg h-7 text-xs" onClick={() => setEditingField(null)}>キャンセル</Button>
                                    <Button size="sm" className="rounded-lg h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => saveField('goal')}>保存</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{project.goal || '未設定'}</p>
                        )}
                    </div>

                    {/* 期限 + メモ */}
                    <div className="space-y-3">
                        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                <Calendar className="h-3.5 w-3.5" /> 期限
                            </span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:ring-1 focus:ring-indigo-400 outline-none"
                                    value={project.due_date || ''}
                                    onChange={e => updateProject({ due_date: e.target.value || null })}
                                />
                                {daysLeft !== null && (
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${daysLeft < 0 ? 'bg-red-100 text-red-600' : daysLeft <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {daysLeft < 0 ? `${Math.abs(daysLeft)}日超過` : daysLeft === 0 ? '今日' : `残り${daysLeft}日`}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <StickyNote className="h-3.5 w-3.5" /> メモ
                                </span>
                                <button
                                    onClick={() => { setEditingField('notes'); setTempValue(project.notes || '') }}
                                    className="p-1 rounded hover:bg-slate-100 text-slate-400"
                                >
                                    <Pencil className="h-3 w-3" />
                                </button>
                            </div>
                            {editingField === 'notes' ? (
                                <div className="space-y-2">
                                    <textarea
                                        autoFocus
                                        className="w-full text-sm border border-indigo-300 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                                        rows={3}
                                        value={tempValue}
                                        onChange={e => setTempValue(e.target.value)}
                                        placeholder="自由にメモを記入..."
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="outline" className="rounded-lg h-7 text-xs" onClick={() => setEditingField(null)}>キャンセル</Button>
                                        <Button size="sm" className="rounded-lg h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => saveField('notes')}>保存</Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{project.notes || '未記入'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* タスク一覧 */}
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 sm:p-5">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> タスク
                    </h2>
                    <div className="space-y-1">
                        {tasks.map(task => (
                            <div key={task.id} className="group flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                                <button
                                    onClick={() => toggleTask(task.id, task.completed)}
                                    className="flex-shrink-0"
                                >
                                    {task.completed
                                        ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        : <Circle className="h-5 w-5 text-slate-300 hover:text-indigo-400 transition-colors" />
                                    }
                                </button>
                                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {task.title}
                                </span>
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-300 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {/* タスク追加フォーム */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                        <Input
                            placeholder="新しいタスクを追加..."
                            className="rounded-xl h-9 text-sm"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') addTask() }}
                        />
                        <Button
                            onClick={addTask}
                            size="sm"
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-9 px-3"
                            disabled={!newTaskTitle.trim()}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* 紐づきアプリ */}
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 sm:p-5">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        📱 紐づきアプリ
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full normal-case">{apps.length}件</span>
                    </h2>
                    {apps.length === 0 ? (
                        <p className="text-sm text-slate-400">このプロジェクトに紐づくアプリはまだありません。アプリの編集画面からプロジェクトを設定してください。</p>
                    ) : (
                        <div className="space-y-2">
                            {apps.map(app => (
                                <div key={app.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="text-xl w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {app.icon || '📱'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{app.display_name || app.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${app.status === '採用' ? 'bg-emerald-500' : app.status === '企画中' ? 'bg-amber-400' : app.status === '保留' ? 'bg-slate-400' : 'bg-red-400'}`} />
                                            <span className="text-[11px] text-slate-500">{app.status}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {app.url && (
                                            <a href={app.url} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="ghost" className="h-8 px-2 text-indigo-600 hover:bg-indigo-50">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </a>
                                        )}
                                        <Link href={`/apps/${app.id}`}>
                                            <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 hover:text-indigo-600">
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
