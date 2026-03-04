import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// サイドバー用のチE�Eタをまとめて返すAPI
export async function GET() {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // 3つのクエリを並列実衁E
    const [projectsRes, categoriesRes, appsRes] = await Promise.all([
        supabase.from('projects').select('id, name, color').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name, color').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('apps').select('status').eq('user_id', userId),
    ])

    const apps = appsRes.data || []
    const stats = {
        total: apps.length,
        active: apps.filter((a: any) => a.status === '採用').length,
        planning: apps.filter((a: any) => a.status === '企画中').length,
        hold: apps.filter((a: any) => a.status === '保留').length,
    }

    return NextResponse.json({
        projects: projectsRes.data || [],
        categories: categoriesRes.data || [],
        stats,
    })
}
