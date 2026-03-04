import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
            .from('apps')
            .select('*, categories(*), projects(*), app_tasks(*)')
            .eq('user_id', userId)
            .order('sort_order', { ascending: true })

        if (error) throw error
        return NextResponse.json(data)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
