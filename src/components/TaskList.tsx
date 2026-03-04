'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Task {
    id: string
    title: string
    completed: boolean
    sort_order: number
}

interface TaskListProps {
    appId: string
}

export default function TaskList({ appId }: TaskListProps) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTask, setNewTask] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTasks()
    }, [appId])

    const fetchTasks = async () => {
        try {
            const res = await fetch(`/api/apps/${appId}/tasks`)
            if (res.ok) setTasks(await res.json())
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // タスク追加
    const handleAdd = async () => {
        if (!newTask.trim()) return
        try {
            const res = await fetch(`/api/apps/${appId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTask.trim(), sort_order: tasks.length })
            })
            if (res.ok) {
                const task = await res.json()
                setTasks(prev => [...prev, task])
                setNewTask('')
            }
        } catch (err) {
            console.error(err)
        }
    }

    // 完了トグル
    const handleToggle = async (taskId: string, completed: boolean) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t))
        try {
            await fetch(`/api/apps/${appId}/tasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, completed: !completed })
            })
        } catch (err) {
            console.error(err)
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t))
        }
    }

    // タスク削除
    const handleDelete = async (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId))
        try {
            await fetch(`/api/apps/${appId}/tasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', taskId })
            })
        } catch (err) {
            console.error(err)
            fetchTasks()
        }
    }

    const completedCount = tasks.filter(t => t.completed).length
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    📋 タスク
                    {tasks.length > 0 && (
                        <span className="text-xs text-slate-400 font-normal">
                            {completedCount}/{tasks.length} 完了 ({progress}%)
                        </span>
                    )}
                </h3>
            </div>

            {/* 進捗バー */}
            {tasks.length > 0 && (
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* タスクリスト */}
            <div className="space-y-1">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className="flex items-center gap-2 group py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <button onClick={() => handleToggle(task.id, task.completed)} className="flex-shrink-0">
                            {task.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                            ) : (
                                <Circle className="h-5 w-5 text-slate-300 hover:text-indigo-400 transition-colors" />
                            )}
                        </button>
                        <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                            {task.title}
                        </span>
                        <button
                            onClick={() => handleDelete(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                        >
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                    </div>
                ))}
            </div>

            {/* 新規タスク入力 */}
            <div className="flex gap-2">
                <Input
                    placeholder="新しいタスクを追加..."
                    className="rounded-xl h-9 text-sm border-slate-200"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
                />
                <button
                    onClick={handleAdd}
                    disabled={!newTask.trim()}
                    className="flex-shrink-0 w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-colors disabled:opacity-30"
                >
                    <Plus className="h-4 w-4 text-indigo-600" />
                </button>
            </div>
        </div>
    )
}
