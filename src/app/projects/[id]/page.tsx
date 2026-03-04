import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import ProjectDetailClient from '@/components/ProjectDetailClient'
import { redirect } from 'next/navigation'

import { Suspense } from 'react'
import ProjectDetailLoading from './loading'

export const dynamic = 'force-dynamic'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<ProjectDetailLoading />}>
            <ProjectDetailContent params={params} />
        </Suspense>
    )
}

async function ProjectDetailContent({ params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const { id } = await params
    const supabase = getSupabaseAdmin()

    // プロジェクト本体
    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

    if (error || !project) redirect('/projects')

    // プロジェクトタスク
    const { data: tasks } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', id)
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })

    // 紐づきアプリ
    const { data: apps } = await supabase
        .from('apps')
        .select('id, name, display_name, icon, status, url')
        .eq('project_id', id)
        .eq('user_id', userId)

    return (
        <ProjectDetailClient
            initialProject={project}
            initialTasks={tasks || []}
            initialApps={apps || []}
        />
    )
}
