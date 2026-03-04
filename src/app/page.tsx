import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import DashboardClient from '@/components/DashboardClient'
import { Database } from '@/types/supabase'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type AppWithRelations = Database['public']['Tables']['apps']['Row'] & {
    categories: Database['public']['Tables']['categories']['Row'] | null
    projects: Database['public']['Tables']['projects']['Row'] | null
    app_tasks: Database['public']['Tables']['app_tasks']['Row'][] | null
}

export default async function DashboardPage() {
    const { userId } = await auth()

    if (!userId) {
        // 未ログインの場合はサインインへリダイレクト（ミドルウェアでも制御しているが念のため）
        redirect('/sign-in')
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('apps')
        .select('*, categories(*), projects(*), app_tasks(*)')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })

    if (error) {
        console.error('Failed to load apps:', error.message)
        // エラー時は空配列を渡すかエラー画面を描画する
        return <DashboardClient initialApps={[]} />
    }

    return <DashboardClient initialApps={data || []} />
}
