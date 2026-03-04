'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useRef, useCallback } from 'react'

// BottomNavの頁E��E
const PAGES = ['/', '/tools', '/projects'] as const

export default function SwipeableLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const currentIndex = PAGES.indexOf(pathname as typeof PAGES[number])
    const touchStartX = useRef(0)
    const touchStartY = useRef(0)
    const touchDeltaX = useRef(0)
    const isNavigating = useRef(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (currentIndex === -1 || isNavigating.current) return
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
        touchDeltaX.current = 0
        if (containerRef.current) {
            containerRef.current.style.transition = 'none'
        }
    }, [currentIndex])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (currentIndex === -1 || isNavigating.current) return
        const deltaX = e.touches[0].clientX - touchStartX.current
        const deltaY = e.touches[0].clientY - touchStartY.current

        // 縦スクロールの方が大きい場合�E無要E
        if (Math.abs(deltaY) > Math.abs(deltaX)) return

        touchDeltaX.current = deltaX

        // 持E��追従してコンチE��チE��動かぁE
        if (containerRef.current) {
            // 端ペ�Eジでは抵抗感�E�Eampening�E�を加える
            let adjustedDelta = deltaX
            if ((currentIndex === 0 && deltaX > 0) || (currentIndex === PAGES.length - 1 && deltaX < 0)) {
                adjustedDelta = deltaX * 0.3 // 端では30%の追征E
            }
            containerRef.current.style.transform = `translateX(${adjustedDelta}px)`
            containerRef.current.style.opacity = String(1 - Math.abs(adjustedDelta) / 800)
        }
    }, [currentIndex])

    const handleTouchEnd = useCallback(() => {
        if (currentIndex === -1 || isNavigating.current) return

        const delta = touchDeltaX.current
        const threshold = 80

        // 允E�E位置に戻すアニメーション
        if (containerRef.current) {
            containerRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out'
        }

        if (delta < -threshold && currentIndex < PAGES.length - 1) {
            // 左スワイチEↁE次のペ�Eジ
            isNavigating.current = true
            if (containerRef.current) {
                containerRef.current.style.transform = 'translateX(-100px)'
                containerRef.current.style.opacity = '0'
            }
            setTimeout(() => {
                router.push(PAGES[currentIndex + 1])
                isNavigating.current = false
            }, 150)
        } else if (delta > threshold && currentIndex > 0) {
            // 右スワイチEↁE前�Eペ�Eジ
            isNavigating.current = true
            if (containerRef.current) {
                containerRef.current.style.transform = 'translateX(100px)'
                containerRef.current.style.opacity = '0'
            }
            setTimeout(() => {
                router.push(PAGES[currentIndex - 1])
                isNavigating.current = false
            }, 150)
        } else {
            // 閾値未満 ↁE允E��戻ぁE
            if (containerRef.current) {
                containerRef.current.style.transform = 'translateX(0)'
                containerRef.current.style.opacity = '1'
            }
        }
    }, [currentIndex, router])

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            style={{ willChange: 'transform, opacity' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {children}
        </div>
    )
}
