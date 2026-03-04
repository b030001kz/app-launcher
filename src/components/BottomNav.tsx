'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wrench, PlusCircle, Folder } from 'lucide-react'

export default function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        {
            name: 'ホーム',
            href: '/',
            icon: Home,
            isActive: pathname === '/'
        },
        {
            name: '追加',
            href: '/apps/new',
            icon: PlusCircle,
            isActive: pathname === '/apps/new'
        },
        {
            name: 'ツール',
            href: '/tools',
            icon: Wrench,
            isActive: pathname === '/tools'
        },
        {
            name: 'プロジェクト',
            href: '/projects',
            icon: Folder,
            isActive: pathname === '/projects'
        }
    ]

    return (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 pb-safe z-50 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            {navItems.map((item) => {
                const Icon = item.icon
                const activeWrapperClass = item.isActive ? 'bg-indigo-50' : 'bg-transparent'
                const activeTextClass = item.isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                const activeIconClass = item.isActive ? 'text-indigo-600' : 'text-slate-400'

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center p-2 min-w-[4rem] transition-all rounded-xl ${activeTextClass}`}
                    >
                        <div className={`p-1.5 rounded-xl transition-colors mb-1 ${activeWrapperClass}`}>
                            <Icon className={`h-5 w-5 ${activeIconClass}`} />
                        </div>
                        <span className="text-[10px]">{item.name}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
