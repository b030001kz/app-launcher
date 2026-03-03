'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

type AppStatus = Database['public']['Tables']['apps']['Row']['status']

interface AppFormProps {
    initialData?: Database['public']['Tables']['apps']['Row']
    isEditing?: boolean
}

export default function AppForm({ initialData, isEditing = false }: AppFormProps) {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
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

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)

        const payload = {
            user_id: user.id,
            name: formData.name,
            url: formData.url,
            icon: formData.icon,
            description: formData.description,
            tags: tagsArray,
            status: formData.status,
            sort_order: formData.sort_order
        }

        let error
        if (isEditing && initialData) {
            const { error: updateError } = await supabase
                .from('apps')
                .update(payload)
                .eq('id', initialData.id)
            error = updateError
        } else {
            const { error: insertError } = await supabase
                .from('apps')
                .insert([payload])
            error = insertError
        }

        if (error) {
            alert(`エラー: ${error.message}`)
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    const handleDelete = async () => {
        if (!isEditing || !initialData) return
        if (!confirm('本当に削除しますか？（通常はステータスを「除外」にすることをお勧めします）')) return

        setLoading(true)
        const { error } = await supabase
            .from('apps')
            .delete()
            .eq('id', initialData.id)

        if (error) {
            alert(`エラー: ${error.message}`)
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            <div className="max-w-2xl mx-auto space-y-4">
                <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    戻る
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'アプリを編集' : '新しいアプリを追加'}</CardTitle>
                        <CardDescription>
                            VercelのアプリURLや詳細情報を入力してください。
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">表示名 *</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="My Project"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">アイコン (絵文字等)</label>
                                    <Input
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="🚀"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">URL (https://...) *</label>
                                <Input
                                    required
                                    type="url"
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://xxx.vercel.app"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">説明</label>
                                <Input
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="アプリの目的や機能"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">タグ (カンマ区切り)</label>
                                <Input
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="Work, Tool, Nextjs"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ステータス</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none focus:ring-2 focus:ring-ring"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as AppStatus })}
                                    >
                                        <option value="採用">採用</option>
                                        <option value="保留">保留</option>
                                        <option value="除外">除外</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">表示順 (昇順)</label>
                                    <Input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            {isEditing ? (
                                <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    物理削除
                                </Button>
                            ) : <div />}
                            <Button type="submit" disabled={loading}>
                                {loading ? '保存中...' : (isEditing ? '更新する' : '追加する')}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
