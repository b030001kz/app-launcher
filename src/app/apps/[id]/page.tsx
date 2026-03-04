import { getApp } from '@/app/actions'
import AppForm from '@/components/AppForm'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

import { Suspense } from 'react'
import DashboardLoading from '../../loading' // appsディレクトリのloadingがないためトップレベルから流用



interface EditAppPageProps {
    params: Promise<{ id: string }>
}

export default function EditAppPage({ params }: EditAppPageProps) {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <EditAppContent params={params} />
        </Suspense>
    )
}

async function EditAppContent({ params }: EditAppPageProps) {
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
