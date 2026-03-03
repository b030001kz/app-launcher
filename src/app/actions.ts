'use server'

import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// アプリ一覧を取得
export async function getApps() {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('認証が必要です')

        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
            .from('apps')
            .select('*')
            .eq('user_id', userId)
            .order('sort_order', { ascending: true })

        if (error) throw new Error(error.message)
        return data
    } catch (err: any) {
        console.error('getApps error:', err)
        throw err
    }
}

// アプリを1件取得
export async function getApp(id: string) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('認証が必要です')

        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
            .from('apps')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (error) throw new Error(error.message)
        return data
    } catch (err: any) {
        console.error('getApp error:', err)
        throw err
    }
}

// アプリを追加
export async function createApp(formData: {
    name: string
    url: string
    icon: string
    description: string
    tags: string[]
    status: '採用' | '保留' | '除外'
    sort_order: number
}) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('認証が必要です')

        const supabase = getSupabaseAdmin()
        const { error } = await supabase
            .from('apps')
            .insert([{ ...formData, user_id: userId }])

        if (error) throw new Error(error.message)
        revalidatePath('/')
    } catch (err: any) {
        console.error('createApp error:', err)
        throw err
    }
}

// アプリを更新
export async function updateApp(id: string, formData: {
    name: string
    url: string
    icon: string
    description: string
    tags: string[]
    status: '採用' | '保留' | '除外'
    sort_order: number
}) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('認証が必要です')

        const supabase = getSupabaseAdmin()
        const { error } = await supabase
            .from('apps')
            .update(formData)
            .eq('id', id)
            .eq('user_id', userId)

        if (error) throw new Error(error.message)
        revalidatePath('/')
    } catch (err: any) {
        console.error('updateApp error:', err)
        throw err
    }
}

// アプリを削除
export async function deleteApp(id: string) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('認証が必要です')

        const supabase = getSupabaseAdmin()
        const { error } = await supabase
            .from('apps')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)

        if (error) throw new Error(error.message)
        revalidatePath('/')
    } catch (err: any) {
        console.error('deleteApp error:', err)
        throw err
    }
}

// Vercelプロジェクト一覧を取得
export async function getVercelProjects(token: string) {
    try {
        const res = await fetch('https://api.vercel.com/v9/projects', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            next: { revalidate: 0 }
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error?.message || 'Vercelからの取得に失敗しました')
        }

        const data = await res.json()
        return data.projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            url: p.targets?.production?.url ? `https://${p.targets.production.url}` : '',
            framework: p.framework,
            updatedAt: p.updatedAt
        }))
    } catch (err: any) {
        console.error('getVercelProjects error:', err)
        throw err
    }
}

// Vercelプロジェクトを一括インポート
export async function importVercelApps(apps: {
    name: string
    url: string
    icon: string
    description: string
    tags: string[]
    status: '採用' | '保留' | '除外'
    sort_order: number
}[]) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('認証が必要です')

        const supabase = getSupabaseAdmin()
        if (!supabase) throw new Error('Supabase admin client could not be initialized.')

        // payloadの作成
        const payload = apps.map(app => ({
            name: app.name,
            url: app.url,
            icon: app.icon || '🚀',
            description: app.description || '',
            tags: Array.isArray(app.tags) ? app.tags : [],
            status: app.status || '採用',
            sort_order: typeof app.sort_order === 'number' ? app.sort_order : 0,
            user_id: userId
        }))

        const { error } = await supabase
            .from('apps')
            .insert(payload)

        if (error) {
            console.error('Supabase insert error details:', error)
            throw new Error(`Supabaseへのインポートに失敗しました: ${error.message}`)
        }

        revalidatePath('/')
        return { success: true }
    } catch (err: any) {
        console.error('importVercelApps error:', err)
        // クライアントに安全にエラーを投げる
        throw new Error(err.message || 'インポート中に不明なエラーが発生しました')
    }
}
