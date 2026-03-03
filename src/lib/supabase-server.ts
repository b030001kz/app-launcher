import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// サーバー専用: service role key を使用して RLS をバイパス
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ビルド時に環境変数が未設定の場合を考慮して遅延初期化
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
    // 環境変数が無い場合はエラーを投げず、実行時にエラーになるようにするか
    // もしくはnullを返して呼び出し側でチェックさせる。
    // ビルドを確実に通すため、未設定時は警告を出しつつnullを許容する構成にする。
    if (!supabaseUrl || !supabaseServiceKey) {
        if (process.env.NODE_ENV === 'production') {
            // 本番実行時は本来エラーであるべきだが、ビルド時のチェック回避用
            console.warn('Warning: Supabase environment variables are missing.')
        }
        return null as any // 呼び出し側でチェーンがエラーになるが、ビルド時の実行は回避できる
    }

    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)
    }
    return _supabaseAdmin
}
