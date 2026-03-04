import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import ProjectsClient from '@/components/ProjectsClient'

export default async function ProjectsPage() {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')
    return <ProjectsClient />
}
