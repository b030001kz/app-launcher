import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'


// ツール一覧取得
export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('dev_tools')
        .select('*')
        .eq('user_id', userId)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

// ツール追加
export async function POST(request: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const body = await request.json()
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
        .from('dev_tools')
        .insert({ ...body, user_id: userId })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

// ツール更新
export async function PATCH(request: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const body = await request.json()
    const { id, ...updateData } = body
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
        .from('dev_tools')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

// ツール削除
export async function DELETE(request: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
        .from('dev_tools')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
