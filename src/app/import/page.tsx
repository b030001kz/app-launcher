'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getVercelProjects, importVercelApps } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface VercelProject {
    id: string
    name: string
    url: string
    framework: string
    updatedAt: number
}

export default function ImportPage() {
    const router = useRouter()
    const [token, setToken] = useState('')
    const [projects, setProjects] = useState<VercelProject[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(false)
    const [importing, setImporting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [step, setStep] = useState<1 | 2>(1)

    const handleFetchProjects = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        setLoading(true)
        setError(null)
        try {
            const data = await getVercelProjects(token)
            setProjects(data)
            setStep(2)
        } catch (err: any) {
            setError(err.message || 'プロジェクトの取得に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedIds)
        if (newSelection.has(id)) {
            newSelection.delete(id)
        } else {
            newSelection.add(id)
        }
        setSelectedIds(newSelection)
    }

    const handleImport = async () => {
        if (selectedIds.size === 0) return

        setImporting(true)
        setError(null)
        try {
            const appsToImport = projects
                .filter(p => selectedIds.has(p.id))
                .map(p => ({
                    name: p.name,
                    url: p.url,
                    icon: '🚀',
                    description: `Vercel Project (${p.framework || 'unknown'})`,
                    tags: ['Vercel', p.framework].filter(Boolean) as string[],
                    status: '採用' as const,
                    sort_order: 0
                }))

            await importVercelApps(appsToImport)
            router.push('/')
        } catch (err: any) {
            setError(err.message || 'インポートに失敗しました')
            setImporting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-4">
                <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    ダッシュボードに戻る
                </Link>

                <Card className="border-slate-200 shadow-lg bg-white">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-white">
                                    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                                </svg>
                            </div>
                            <div>
                                <CardTitle className="text-xl">Vercelからインポート</CardTitle>
                                <CardDescription>
                                    Vercelのプロジェクトを自動的に取得して追加します。
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleFetchProjects} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Vercel Access Token</label>
                                    <Input
                                        type="password"
                                        placeholder="plt_xxxxxxxxxxxxxxxxxxxxxxxx"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        className="border-slate-200"
                                        required
                                    />
                                    <p className="text-xs text-slate-400">
                                        トークンは [Vercel Settings の Tokens](https://vercel.com/account/tokens) から作成できます。
                                    </p>
                                </div>
                                <Button type="submit" disabled={loading || !token} className="w-full bg-black hover:bg-slate-800 text-white gap-2">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    プロジェクトを取得
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-900">{projects.length}件のプロジェクトが見つかりました</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set(projects.map(p => p.id)))} className="text-blue-600 text-xs">
                                        すべて選択
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                    {projects.map(project => (
                                        <div
                                            key={project.id}
                                            onClick={() => toggleSelection(project.id)}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedIds.has(project.id)
                                                ? 'border-blue-600 bg-blue-50/50'
                                                : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xl">
                                                    🚀
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">{project.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{project.url || 'URLなし'}</p>
                                                </div>
                                            </div>
                                            {selectedIds.has(project.id) ? (
                                                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">戻る</Button>
                                    <Button
                                        onClick={handleImport}
                                        disabled={importing || selectedIds.size === 0}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                    >
                                        {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        {selectedIds.size}件をインポートする
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 flex justify-center py-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400">トークンはサーバーに保存されません。インポート時のみ使用されます。</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
