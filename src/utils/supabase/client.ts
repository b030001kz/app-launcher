import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // ビルド時に環境変数が未設定の場合のフォールバック
    if (!supabaseUrl || !supabaseAnonKey) {
        return createBrowserClient<Database>(
            'https://placeholder.supabase.co',
            'placeholder-key'
        )
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
