import AppForm from '@/components/AppForm'

// ビルド時のプリレンダリングを無効化（Supabase接続に実行時の環境変数が必要）
export const dynamic = 'force-dynamic'

export default function NewAppPage() {
    return <AppForm />
}
