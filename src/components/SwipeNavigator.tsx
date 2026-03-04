'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// BottomNav縺ｨ蜷後§鬆・分縺ｧ逕ｻ髱｢繧貞ｮ夂ｾｩ
const PAGES = ['/', '/tools', '/projects'] as const

export default function SwipeNavigator() {
    const pathname = usePathname()
    const router = useRouter()
    const touchStartX = useRef(0)
    const touchStartY = useRef(0)
    const isSwiping = useRef(false)

    useEffect(() => {
        const currentIndex = PAGES.indexOf(pathname as typeof PAGES[number])
        if (currentIndex === -1) return // 蟇ｾ雎｡螟悶・繝壹・繧ｸ縺ｧ縺ｯ繧ｹ繝ｯ繧､繝礼┌蜉ｹ

        const THRESHOLD = 80   // 繧ｹ繝ｯ繧､繝怜愛螳壹・譛蟆剰ｷ晞屬(px)
        const MAX_Y_DIFF = 60  // 邵ｦ譁ｹ蜷代・險ｱ螳ｹ驥・px) 窶・邵ｦ繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ縺ｨ縺ｮ隱､辷・亟豁｢

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

            // 邵ｦ譁ｹ蜷代・繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ縺悟､ｧ縺阪＞蝣ｴ蜷医・辟｡隕・
            if (deltaY > MAX_Y_DIFF) return

            if (deltaX < -THRESHOLD && currentIndex < PAGES.length - 1) {
                // 蟾ｦ繧ｹ繝ｯ繧､繝・竊・谺｡縺ｮ繝壹・繧ｸ縺ｸ
                router.push(PAGES[currentIndex + 1])
            } else if (deltaX > THRESHOLD && currentIndex > 0) {
                // 蜿ｳ繧ｹ繝ｯ繧､繝・竊・蜑阪・繝壹・繧ｸ縺ｸ
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

    return null // UI縺ｯ謠冗判縺励↑縺・
}
