import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import ToolsClient from '@/components/ToolsClient'
import { Database } from '@/types/supabase'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type DevTool = Database['public']['Tables']['dev_tools']['Row']

export default async function ToolsPage() {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('dev_tools')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to load tools:', error.message)
        return <ToolsClient initialTools={[]} />
    }

    return <ToolsClient initialTools={data || []} />
}
