import { createClient } from '@/utils/supabase/server'
import AppForm from '@/components/AppForm'
import { notFound } from 'next/navigation'

// ビルド時のプリレンダリングを無効化（Supabase接続に実行時の環境変数が必要）
export const dynamic = 'force-dynamic'

interface EditAppPageProps {
    params: Promise<{ id: string }>
}

export default async function EditAppPage({ params }: EditAppPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: app, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !app) {
        notFound()
    }

    return <AppForm initialData={app} isEditing />
}
