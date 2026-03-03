'use server'

import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// アプリ一覧を取得
export async function getApps() {
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
}

// アプリを1件取得
export async function getApp(id: string) {
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
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
        .from('apps')
        .insert([{ ...formData, user_id: userId }])

    if (error) throw new Error(error.message)
    revalidatePath('/')
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
}

// アプリを削除
export async function deleteApp(id: string) {
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
}

// Vercelプロジェクト一覧を取得
export async function getVercelProjects(token: string) {
    const res = await fetch('https://api.vercel.com/v9/projects', {
        headers: {
            Authorization: `Bearer ${token}`
        }
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
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    const supabase = getSupabaseAdmin()
    const payload = apps.map(app => ({ ...app, user_id: userId }))

    const { error } = await supabase
        .from('apps')
        .insert(payload)

    if (error) throw new Error(error.message)
    revalidatePath('/')
}

