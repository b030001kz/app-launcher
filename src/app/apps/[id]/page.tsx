import { getApp } from '@/app/actions'
import AppForm from '@/components/AppForm'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

interface EditAppPageProps {
    params: Promise<{ id: string }>
}

export default async function EditAppPage({ params }: EditAppPageProps) {
    const { userId } = await auth()
    if (!userId) notFound()

    const { id } = await params

    try {
        const app = await getApp(id)
        return <AppForm initialData={app} isEditing />
    } catch {
        notFound()
    }
}
