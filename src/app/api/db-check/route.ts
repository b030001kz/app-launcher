import { getSupabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 一時的なマイグレーションAPI（実行後に削除すること）
export async function GET() {
    const supabase = getSupabaseAdmin()
    const results: string[] = []

    // 1. projectsテーブルにカラム追加（rpc不要、直接INSERT/SELECTで確認）
    // service_role keyを使っているのでRPC経由でraw SQLを実行
    try {
        // status カラム追加
        const { error: e1 } = await supabase.rpc('exec_sql' as any, {
            query: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text DEFAULT '計画中'`
        })
        results.push(e1 ? `status: ${e1.message}` : 'status: OK')
    } catch (e: any) { results.push(`status error: ${e.message}`) }

    try {
        const { error: e2 } = await supabase.rpc('exec_sql' as any, {
            query: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS goal text`
        })
        results.push(e2 ? `goal: ${e2.message}` : 'goal: OK')
    } catch (e: any) { results.push(`goal error: ${e.message}`) }

    try {
        const { error: e3 } = await supabase.rpc('exec_sql' as any, {
            query: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS notes text`
        })
        results.push(e3 ? `notes: ${e3.message}` : 'notes: OK')
    } catch (e: any) { results.push(`notes error: ${e.message}`) }

    try {
        const { error: e4 } = await supabase.rpc('exec_sql' as any, {
            query: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS due_date date`
        })
        results.push(e4 ? `due_date: ${e4.message}` : 'due_date: OK')
    } catch (e: any) { results.push(`due_date error: ${e.message}`) }

    // 2. project_tasksテーブル作成
    try {
        const { error: e5 } = await supabase.rpc('exec_sql' as any, {
            query: `CREATE TABLE IF NOT EXISTS project_tasks (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
                user_id text NOT NULL,
                title text NOT NULL,
                completed boolean DEFAULT false,
                sort_order integer DEFAULT 0,
                created_at timestamp with time zone DEFAULT now()
            )`
        })
        results.push(e5 ? `project_tasks table: ${e5.message}` : 'project_tasks table: OK')
    } catch (e: any) { results.push(`project_tasks error: ${e.message}`) }

    // 3. RLS有効化
    try {
        const { error: e6 } = await supabase.rpc('exec_sql' as any, {
            query: `ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY`
        })
        results.push(e6 ? `RLS: ${e6.message}` : 'RLS: OK')
    } catch (e: any) { results.push(`RLS error: ${e.message}`) }

    return NextResponse.json({ results })
}
