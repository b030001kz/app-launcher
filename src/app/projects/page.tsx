import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import ProjectsClient from '@/components/ProjectsClient'
import { Database } from '@/types/supabase'
import { redirect } from 'next/navigation'

import { Suspense } from 'react'
import ProjectsLoading from './loading'

type Project = Database['public']['Tables']['projects']['Row']

export const dynamic = 'force-dynamic'

export default function ProjectsPage() {
    return (
        <Suspense fallback={<ProjectsLoading />}>
            <ProjectsContent />
        </Suspense>
    )
}

async function ProjectsContent() {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const supabase = getSupabaseAdmin()

    // プロジェクト一覧
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    const projects = (data || []) as Project[]

    if (error) {
        console.error('Failed to load projects:', error.message)
        return <ProjectsClient initialProjects={[]} projectMeta={{}} />
    }

    // 各プロジェクトのメタ情報（タスク数・完了数・紐づきアプリ数）を取得
    const meta: Record<string, { taskTotal: number; taskDone: number; appCount: number }> = {}

    if (projects && projects.length > 0) {
        const projectIds: string[] = projects.map(p => p.id)

        // タスク集計
        const { data: tasks } = await supabase
            .from('project_tasks')
            .select('project_id, completed')
            .in('project_id', projectIds)
            .eq('user_id', userId)

        // アプリ集計
        const { data: apps } = await supabase
            .from('apps')
            .select('project_id')
            .not('project_id', 'is', null)
            .in('project_id', projectIds)
            .eq('user_id', userId)

        for (const pid of projectIds) {
            const projectTasks = (tasks || []).filter((t: { project_id: string; completed: boolean }) => t.project_id === pid)
            const projectApps = (apps || []).filter((a: { project_id: string | null }) => a.project_id === pid)
            meta[pid] = {
                taskTotal: projectTasks.length,
                taskDone: projectTasks.filter((t: { completed: boolean }) => t.completed).length,
                appCount: projectApps.length,
            }
        }
    }

    return <ProjectsClient initialProjects={projects || []} projectMeta={meta} />
}
