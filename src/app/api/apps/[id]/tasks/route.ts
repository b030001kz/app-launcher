import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// タスク一覧取得
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const { id } = await params
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('app_tasks')
        .select('*')
        .eq('app_id', id)
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

// タスク追加
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
        .from('app_tasks')
        .insert({ app_id: id, user_id: userId, title: body.title, sort_order: body.sort_order || 0 })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

// タスク更新・削除
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const body = await request.json()
    const supabase = getSupabaseAdmin()

    // 削除リクエスト
    if (body.action === 'delete' && body.taskId) {
        const { error } = await supabase
            .from('app_tasks')
            .delete()
            .eq('id', body.taskId)
            .eq('user_id', userId)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true })
    }

    // 完了トグル
    if (body.taskId && typeof body.completed === 'boolean') {
        const { data, error } = await supabase
            .from('app_tasks')
            .update({ completed: body.completed })
            .eq('id', body.taskId)
            .eq('user_id', userId)
            .select()
            .single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data)
    }

    return NextResponse.json({ error: '不正なリクエスト' }, { status: 400 })
}
