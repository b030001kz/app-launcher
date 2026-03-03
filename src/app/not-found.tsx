export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
                <p className="text-slate-500 mb-6">ページが見つかりません</p>
                <a href="/" className="text-blue-600 hover:underline">ダッシュボードに戻る</a>
            </div>
        </div>
    )
}
