'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getVercelProjects, importVercelApps, getVercelConnection, saveVercelConnection, disconnectVercel } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Download, CheckCircle2, AlertCircle, Loader2, Link2, RefreshCw, Trash2 } from 'lucide-react'
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
    const [loading, setLoading] = useState(true)
    const [isFetching, setIsFetching] = useState(false)
    const [importing, setImporting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasStoredConnection, setHasStoredConnection] = useState(false)
    const [step, setStep] = useState<1 | 2>(1)

    // 保存済みの連携情報をチェック
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const storedToken = await getVercelConnection()
                if (storedToken) {
                    setHasStoredConnection(true)
                    setStep(2)
                    // 自動でプロジェクト取得
                    await fetchProjects(storedToken)
                }
            } catch (err) {
                console.error('Connection check failed:', err)
            } finally {
                setLoading(false)
            }
        }
        checkConnection()
    }, [])

    const fetchProjects = async (targetToken: string) => {
        setIsFetching(true)
        setError(null)
        try {
            const data = await getVercelProjects(targetToken)
            setProjects(data)
            setStep(2)
        } catch (err: any) {
            setError(err.message || 'プロジェクトの取得に失敗しました。トークンが無効な可能性があります。')
            if (hasStoredConnection) {
                setHasStoredConnection(false)
                setStep(1)
            }
        } finally {
            setIsFetching(false)
        }
    }

    const handleInitialConnect = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        setIsFetching(true)
        setError(null)
        try {
            // 1. プロジェクトが取れるか確認
            const data = await getVercelProjects(token)
            // 2. 問題なければ保存
            await saveVercelConnection(token)

            setProjects(data)
            setHasStoredConnection(true)
            setStep(2)
        } catch (err: any) {
            setError(err.message || '連携に失敗しました')
        } finally {
            setIsFetching(false)
        }
    }

    const handleDisconnect = async () => {
        if (!confirm('Vercelとの連携を解除しますか？')) return
        setLoading(true)
        try {
            await disconnectVercel()
            setHasStoredConnection(false)
            setProjects([])
            setToken('')
            setStep(1)
        } catch (err: any) {
            setError(err.message)
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
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'インポートに失敗しました')
            setImporting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-slate-500 animate-pulse">連携状態を確認中...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-4">
                <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    ダッシュボードに戻る
                </Link>

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <Card className="border-slate-200 shadow-xl bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                    <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-white">
                                        <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                                    </svg>
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Vercel連携</CardTitle>
                                    <CardDescription>
                                        {hasStoredConnection ? '連携済みのアカウントからインポートします' : 'Vercelプロジェクトを自動取得します'}
                                    </CardDescription>
                                </div>
                            </div>
                            {hasStoredConnection && (
                                <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        {step === 1 ? (
                            <form onSubmit={handleInitialConnect} className="space-y-6">
                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                                    <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                        <Link2 className="h-4 w-4" />
                                        初回セットアップ
                                    </h4>
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        一度Vercelのトークンを登録すると、次回からボタン一つでプロジェクトを同期できます。
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Vercel Access Token</label>
                                    <Input
                                        type="password"
                                        placeholder="plt_xxxxxxxxxxxxxxxxxxxxxxxx"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        className="border-slate-200 h-11"
                                        required
                                    />
                                    <p className="text-xs text-slate-400">
                                        [Vercel Settings の Tokens](https://vercel.com/account/tokens) から作成して貼り付けてください。
                                    </p>
                                </div>
                                <Button type="submit" disabled={isFetching || !token} className="w-full bg-black hover:bg-slate-800 text-white h-11 gap-2 shadow-lg shadow-black/10 transition-all active:scale-[0.98]">
                                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                                    Vercelと連携する
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-md font-bold text-slate-900">プロジェクトを選択</h3>
                                        <p className="text-xs text-slate-500">{projects.length}件のプロジェクトが見つかりました</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => fetchProjects(token)} disabled={isFetching} className="h-8 gap-1.5 px-3">
                                            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                                            更新
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set(projects.map(p => p.id)))} className="h-8 text-blue-600 hover:text-blue-700 text-xs px-3">
                                            すべて選択
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2.5 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                    {projects.length > 0 ? projects.map(project => (
                                        <div
                                            key={project.id}
                                            onClick={() => toggleSelection(project.id)}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedIds.has(project.id)
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/10'
                                                : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform ${selectedIds.has(project.id) ? 'scale-110' : ''}`}>
                                                    🚀
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`font-bold transition-colors ${selectedIds.has(project.id) ? 'text-blue-700' : 'text-slate-900'} truncate`}>{project.name}</p>
                                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{project.url || 'URLなし'}</p>
                                                </div>
                                            </div>
                                            {selectedIds.has(project.id) ? (
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex-shrink-0" />
                                            )}
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                                            <p className="text-slate-400 text-sm">プロジェクトが見つかりませんでした</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleImport}
                                        disabled={importing || selectedIds.size === 0}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-md font-bold gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                                    >
                                        {importing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                                        {selectedIds.size > 0 ? `${selectedIds.size}件をインポートする` : 'インポートする項目を選択'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 flex flex-col items-center gap-1 py-4 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Secure Connection</p>
                        <p className="text-xs text-slate-400">トークンはあなた自身のデータベースに暗号化されずに保存されます。取り扱いにはご注意ください。</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
