import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'



// アプリの部分更新（表示名のインライン編集など）
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await request.json()
        const supabase = getSupabaseAdmin()

        // 許可されたフィールドのみ更新
        const allowedFields = ['display_name', 'category_id', 'project_id', 'status', 'notes']
        const updateData: Record<string, unknown> = {}
        for (const field of allowedFields) {
            if (field in body) {
                updateData[field] = body[field]
            }
        }

        const { data, error } = await supabase
            .from('apps')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
