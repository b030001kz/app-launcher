import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { NextResponse, NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// プロジェクト詳細取得（タスク + 紐づきアプリ含む）
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const { id } = await params
    const supabase = getSupabaseAdmin()

    // プロジェクト本体
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

    if (projectError) return NextResponse.json({ error: projectError.message }, { status: 500 })

    // プロジェクトタスク
    const { data: tasks } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', id)
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })

    // 紐づきアプリ
    const { data: apps } = await supabase
        .from('apps')
        .select('id, name, display_name, icon, status, url')
        .eq('project_id', id)
        .eq('user_id', userId)

    return NextResponse.json({ project, tasks: tasks || [], apps: apps || [] })
}

// プロジェクト更新
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
        .from('projects')
        .update(body)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

// プロジェクト削除
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
