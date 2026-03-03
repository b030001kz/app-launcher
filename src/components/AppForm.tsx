'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createApp, updateApp, deleteApp } from '@/app/actions'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Trash2, Save } from 'lucide-react'
import Link from 'next/link'

type AppStatus = Database['public']['Tables']['apps']['Row']['status']

interface AppFormProps {
    initialData?: Database['public']['Tables']['apps']['Row']
    isEditing?: boolean
}

export default function AppForm({ initialData, isEditing = false }: AppFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        url: initialData?.url || '',
        icon: initialData?.icon || '📱',
        description: initialData?.description || '',
        tags: initialData?.tags?.join(', ') || '',
        status: (initialData?.status || '採用') as AppStatus,
        sort_order: initialData?.sort_order || 0
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        const payload = {
            name: formData.name,
            url: formData.url,
            icon: formData.icon,
            description: formData.description,
            tags: tagsArray,
            status: formData.status,
            sort_order: formData.sort_order
        }

        try {
            if (isEditing && initialData) {
                await updateApp(initialData.id, payload)
            } else {
                await createApp(payload)
            }
            router.push('/')
        } catch (err: any) {
            setError(err.message || '保存に失敗しました')
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!isEditing || !initialData) return
        if (!confirm('本当に削除しますか？（通常は「除外」ステータスにすることをお勧めします）')) return

        setLoading(true)
        try {
            await deleteApp(initialData.id)
            router.push('/')
        } catch (err: any) {
            setError(err.message || '削除に失敗しました')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-8">
            <div className="max-w-2xl mx-auto space-y-4">
                <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    ダッシュボードに戻る
                </Link>

                <Card className="border-slate-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">{isEditing ? 'アプリを編集' : '新しいアプリを追加'}</CardTitle>
                        <CardDescription>
                            VercelのアプリURLや詳細情報を入力してください。
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-5">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">表示名 <span className="text-red-500">*</span></label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="My Project"
                                        className="border-slate-200"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">アイコン</label>
                                    <Input
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="🚀"
                                        className="border-slate-200 text-center text-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">URL <span className="text-red-500">*</span></label>
                                <Input
                                    required
                                    type="url"
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://xxx.vercel.app"
                                    className="border-slate-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">説明</label>
                                <Input
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="アプリの目的や機能"
                                    className="border-slate-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">タグ <span className="text-xs text-slate-400">(カンマ区切り)</span></label>
                                <Input
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="Work, Tool, Next.js"
                                    className="border-slate-200"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">ステータス</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as AppStatus })}
                                    >
                                        <option value="採用">✅ 採用</option>
                                        <option value="保留">⏸️ 保留</option>
                                        <option value="除外">🚫 除外</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">表示順</label>
                                    <Input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                        className="border-slate-200"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
                            {isEditing ? (
                                <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading} className="w-full sm:w-auto">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    削除
                                </Button>
                            ) : <div />}
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 gap-1.5">
                                <Save className="h-4 w-4" />
                                {loading ? '保存中...' : (isEditing ? '更新する' : '追加する')}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
