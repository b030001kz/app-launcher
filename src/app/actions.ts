'use server'

import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// --- Apps ---

export async function getApps() {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('認証が必要です')

        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
            .from('apps')
            .select('*, categories(*), projects(*)')
            .eq('user_id', userId)
            .order('sort_order', { ascending: true })

        if (error) throw new Error(error.message)
        return data
    } catch (err: any) {
        console.error('getApps error:', err)
        throw err
    }
}

export async function getApp(id: string) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('認証が必要です')

        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
            .from('apps')
            .select('*, categories(*), projects(*)')
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

export async function createApp(formData: {
    name: string
    display_name?: string | null
    url: string
    icon: string
    description: string
    tags: string[]
    status: '採用' | '保留' | '除外' | '企画中'
    sort_order: number
    category_id?: string | null
    project_id?: string | null
    notes?: string | null
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

export async function updateApp(id: string, formData: {
    name: string
    display_name?: string | null
    url: string
    icon: string
    description: string
    tags: string[]
    status: '採用' | '保留' | '除外' | '企画中'
    sort_order: number
    category_id?: string | null
    project_id?: string | null
    notes?: string | null
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

// --- Categories ---

export async function getCategories() {
    const { userId } = await auth()
    if (!userId) return []
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('categories').select('*').eq('user_id', userId).order('name')
    if (error) throw error
    return data
}

export async function createCategory(name: string, color?: string) {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('categories').insert({ name, color, user_id: userId }).select().single()
    if (error) throw error
    return data
}

// --- Projects ---

export async function getProjects() {
    const { userId } = await auth()
    if (!userId) return []
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('name')
    if (error) throw error
    return data
}

export async function createProject(name: string, description?: string, color?: string) {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('projects').insert({ name, description, color, user_id: userId }).select().single()
    if (error) throw error
    return data
}

// --- Vercel ---

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

export async function importVercelApps(apps: {
    name: string
    display_name?: string | null
    url: string
    icon: string
    description: string
    tags: string[]
    status: '採用' | '保留' | '除外' | '企画中'
    sort_order: number
    category_id?: string | null
    project_id?: string | null
}[]) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('認証が必要です')

        const supabase = getSupabaseAdmin()
        if (!supabase) throw new Error('Supabase admin client could not be initialized.')

        // 既存アプリを取得して名前で重複チェック
        const { data: existingApps } = await supabase
            .from('apps')
            .select('id, name')
            .eq('user_id', userId)

        const existingNames = new Set((existingApps || []).map((a: { name: string }) => a.name))
        const newApps = apps.filter((app: { name: string }) => !existingNames.has(app.name))

        if (newApps.length === 0) {
            revalidatePath('/')
            return { success: true, added: 0, skipped: apps.length }
        }

        const payload = newApps.map(app => ({
            ...app,
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
        return { success: true, added: newApps.length, skipped: apps.length - newApps.length }
    } catch (err: any) {
        console.error('importVercelApps error:', err)
        throw new Error(err.message || 'インポート中に不明なエラーが発生しました')
    }
}

export async function saveVercelConnection(token: string) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('認証が必要です')

        const supabase = getSupabaseAdmin()
        const { error } = await supabase
            .from('vercel_connections')
            .upsert({ user_id: userId, access_token: token })

        if (error) throw new Error(error.message)
        revalidatePath('/')
    } catch (err: any) {
        console.error('saveVercelConnection error:', err)
        throw err
    }
}

export async function getVercelConnection() {
    try {
        const { userId } = await auth()
        if (!userId) return null

        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
            .from('vercel_connections')
            .select('access_token')
            .eq('user_id', userId)
            .maybeSingle()

        if (error) {
            console.error('getVercelConnection error:', error)
            return null
        }
        return data?.access_token || null
    } catch (err) {
        return null
    }
}

export async function disconnectVercel() {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('認証が必要です')

        const supabase = getSupabaseAdmin()
        const { error } = await supabase
            .from('vercel_connections')
            .delete()
            .eq('user_id', userId)

        if (error) throw new Error(error.message)
        revalidatePath('/')
    } catch (err: any) {
        console.error('disconnectVercel error:', err)
        throw err
    }
}
