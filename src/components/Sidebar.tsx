import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import SidebarClient from './SidebarClient'

export default async function Sidebar() {
    const { userId } = await auth()

    if (!userId) {
        return null // 未ログイン時はサイドバーを表示しない
    }

    const supabase = getSupabaseAdmin()

    // 1. プロジェクト一覧の取得
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    // 2. カテゴリ一覧の取得
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    // 3. アプリの統計情報を取得（全て、稼働中、企画中、保留）
    const { data: apps } = await supabase
        .from('apps')
        .select('status')
        .eq('user_id', userId)

    const stats = {
        total: apps?.length || 0,
        active: apps?.filter((a: any) => a.status === '採用').length || 0,
        planning: apps?.filter((a: any) => a.status === '企画中').length || 0,
        hold: apps?.filter((a: any) => a.status === '保留').length || 0,
    }

    return (
        <SidebarClient
            projects={projects || []}
            categories={categories || []}
            stats={stats}
        />
    )
}
