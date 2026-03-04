'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createApp, updateApp, deleteApp, getCategories, getProjects, createCategory, createProject } from '@/app/actions'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Trash2, Save, Plus, Tag, Folder } from 'lucide-react'
import Link from 'next/link'

type AppStatus = Database['public']['Tables']['apps']['Row']['status']

interface AppFormProps {
    initialData?: any // Relationを含むためanyを許容
    isEditing?: boolean
}

export default function AppForm({ initialData, isEditing = false }: AppFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetchingData, setFetchingData] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [categories, setCategories] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        display_name: initialData?.display_name || '',
        url: initialData?.url || '',
        icon: initialData?.icon || '📱',
        description: initialData?.description || '',
        tags: initialData?.tags?.join(', ') || '',
        status: (initialData?.status || '採用') as AppStatus,
        sort_order: initialData?.sort_order || 0,
        category_id: initialData?.category_id || '',
        project_id: initialData?.project_id || ''
    })

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [cats, projs] = await Promise.all([getCategories(), getProjects()])
                setCategories(cats)
                setProjects(projs)
            } catch (err) {
                console.error('Failed to load categories/projects:', err)
            } finally {
                setFetchingData(false)
            }
        }
        loadInitialData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const tagsArray = formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        const payload = {
            name: formData.name,
            display_name: formData.display_name || null,
            url: formData.url,
            icon: formData.icon,
            description: formData.description,
            tags: tagsArray,
            status: formData.status,
            sort_order: formData.sort_order,
            category_id: formData.category_id || null,
            project_id: formData.project_id || null
        }

        try {
            if (isEditing && initialData) {
                await updateApp(initialData.id, payload)
            } else {
                await createApp(payload)
            }
            router.push('/')
            router.refresh()
        } catch (err: any) {
            setError(err.message || '保存に失敗しました')
            setLoading(false)
        }
    }

    const handleAddCategory = async () => {
        const name = prompt('新しいカテゴリー名を入力してください')
        if (!name) return
        try {
            const newCat = await createCategory(name)
            setCategories([...categories, newCat])
            setFormData({ ...formData, category_id: newCat.id })
        } catch (err) {
            alert('カテゴリーの作成に失敗しました')
        }
    }

    const handleAddProject = async () => {
        const name = prompt('新しいプロジェクト名を入力してください')
        if (!name) return
        try {
            const newProj = await createProject(name)
            setProjects([...projects, newProj])
            setFormData({ ...formData, project_id: newProj.id })
        } catch (err) {
            alert('プロジェクトの作成に失敗しました')
        }
    }

    const handleDelete = async () => {
        if (!isEditing || !initialData) return
        if (!confirm('本当に削除しますか？')) return

        setLoading(true)
        try {
            await deleteApp(initialData.id)
            router.push('/')
            router.refresh()
        } catch (err: any) {
            setError(err.message || '削除に失敗しました')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-8">
            <div className="max-w-2xl mx-auto space-y-4">
                <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    ダッシュボードに戻る
                </Link>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden ring-1 ring-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-xl font-bold text-slate-800">{isEditing ? 'アプリを編集' : '新しいアプリを追加'}</CardTitle>
                        <CardDescription>
                            アプリの詳細情報を入力してください。表示名を設定すると、ランチャー上でその名前が表示されます。
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-6 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">システム名（Vercel名など） <span className="text-red-500">*</span></label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="my-cool-project"
                                        className="border-slate-200 focus-visible:ring-indigo-500 rounded-xl h-11"
                                    />
                                </div>
                                <div className="space-y-2 text-center">
                                    <label className="text-sm font-bold text-slate-700">アイコン</label>
                                    <Input
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="🚀"
                                        className="border-slate-200 focus-visible:ring-indigo-500 rounded-xl text-center text-2xl h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">表示名（任意）</label>
                                <Input
                                    value={formData.display_name}
                                    onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                                    placeholder="ポートフォリオ"
                                    className="border-slate-200 focus-visible:ring-indigo-500 rounded-xl h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">URL <span className="text-red-500">*</span></label>
                                <Input
                                    required
                                    type="url"
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://xxx.vercel.app"
                                    className="border-slate-200 focus-visible:ring-indigo-500 rounded-xl h-11"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                            <Folder className="h-4 w-4 text-slate-400" /> プロジェクト
                                        </label>
                                        <button type="button" onClick={handleAddProject} className="text-[11px] text-indigo-600 font-bold flex items-center gap-0.5 hover:underline">
                                            <Plus className="h-3 w-3" /> 新規
                                        </button>
                                    </div>
                                    <select
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ring-offset-2"
                                        value={formData.project_id}
                                        onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                                    >
                                        <option value="">未設定</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                            <Tag className="h-4 w-4 text-slate-400" /> カテゴリー
                                        </label>
                                        <button type="button" onClick={handleAddCategory} className="text-[11px] text-indigo-600 font-bold flex items-center gap-0.5 hover:underline">
                                            <Plus className="h-3 w-3" /> 新規
                                        </button>
                                    </div>
                                    <select
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ring-offset-2"
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    >
                                        <option value="">未設定</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">説明</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="アプリの目的や機能"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">ステータス</label>
                                    <select
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ring-offset-2"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as AppStatus })}
                                    >
                                        <option value="採用">✅ Launch</option>
                                        <option value="保留">⏸️ Wait</option>
                                        <option value="除外">🚫 Archive</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">表示順</label>
                                    <Input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                        className="border-slate-200 focus-visible:ring-indigo-500 rounded-xl h-11"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-4 p-6 bg-slate-50/50 border-t border-slate-100">
                            {isEditing ? (
                                <Button type="button" variant="ghost" onClick={handleDelete} disabled={loading} className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 font-bold">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    削除する
                                </Button>
                            ) : <div />}
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-11 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all font-bold">
                                <Save className="h-4 w-4" />
                                {loading ? '保存中...' : (isEditing ? '変更を保存' : 'アプリを登録')}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}

const AlertCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)
