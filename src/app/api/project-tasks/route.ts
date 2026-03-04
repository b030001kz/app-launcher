import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// タスク追加
export async function POST(request: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const body = await request.json()
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
        .from('project_tasks')
        .insert({ ...body, user_id: userId })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

// タスク更新（完了トグル等）
export async function PATCH(request: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const body = await request.json()
    const { id, ...updateData } = body
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
        .from('project_tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

// タスク削除
export async function DELETE(request: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
