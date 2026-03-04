'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// BottomNavと同じ順番で画面を定義
const PAGES = ['/', '/tools', '/projects'] as const

export default function SwipeNavigator() {
    const pathname = usePathname()
    const router = useRouter()
    const touchStartX = useRef(0)
    const touchStartY = useRef(0)
    const isSwiping = useRef(false)

    useEffect(() => {
        const currentIndex = PAGES.indexOf(pathname as typeof PAGES[number])
        if (currentIndex === -1) return // 対象外のページではスワイプ無効

        const THRESHOLD = 80   // スワイプ判定の最小距離(px)
        const MAX_Y_DIFF = 60  // 縦方向の許容量(px) — 縦スクロールとの誤爆防止

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX
            touchStartY.current = e.touches[0].clientY
            isSwiping.current = true
        }

        const handleTouchEnd = (e: TouchEvent) => {
            if (!isSwiping.current) return
            isSwiping.current = false

            const deltaX = e.changedTouches[0].clientX - touchStartX.current
            const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current)

            // 縦方向のスクロールが大きい場合は無視
            if (deltaY > MAX_Y_DIFF) return

            if (deltaX < -THRESHOLD && currentIndex < PAGES.length - 1) {
                // 左スワイプ → 次のページへ
                router.push(PAGES[currentIndex + 1])
            } else if (deltaX > THRESHOLD && currentIndex > 0) {
                // 右スワイプ → 前のページへ
                router.push(PAGES[currentIndex - 1])
            }
        }

        document.addEventListener('touchstart', handleTouchStart, { passive: true })
        document.addEventListener('touchend', handleTouchEnd, { passive: true })

        return () => {
            document.removeEventListener('touchstart', handleTouchStart)
            document.removeEventListener('touchend', handleTouchEnd)
        }
    }, [pathname, router])

    return null // UIは描画しない
}
