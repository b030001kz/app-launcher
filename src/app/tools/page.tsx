import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import ToolsClient from '@/components/ToolsClient'

export default async function ToolsPage() {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')
    return <ToolsClient />
}
