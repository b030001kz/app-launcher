import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import ProjectsClient from '@/components/ProjectsClient'
import { Database } from '@/types/supabase'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Project = Database['public']['Tables']['projects']['Row']

export default async function ProjectsPage() {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to load projects:', error.message)
        return <ProjectsClient initialProjects={[]} />
    }

    return <ProjectsClient initialProjects={data || []} />
}
