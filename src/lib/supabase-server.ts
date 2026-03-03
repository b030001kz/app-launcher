import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// サーバー専用: service role key を使用して RLS をバイパス
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ビルド時に環境変数が未設定の場合を考慮して遅延初期化
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
    // 実行時に環境変数をチェック
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        const errorMsg = 'Supabase environment variables (URL or Service Role Key) are missing.'
        console.error(errorMsg)
        // ビルド時（Next.jsの静的解析）は無視し、実行時のみエラーを投げる
        if (process.env.NODE_ENV === 'production') {
            // 本番環境での実行時エラー
            throw new Error(errorMsg)
        }
        return null as any
    }

    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient<Database>(url, key)
    }
    return _supabaseAdmin
}
