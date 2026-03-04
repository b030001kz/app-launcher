import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import ProjectDetailClient from '@/components/ProjectDetailClient'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')
    const { id } = await params
    return <ProjectDetailClient projectId={id} />
}
