'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useRef, useCallback, useEffect } from 'react'

// BottomNav\u306e\u9806\u5e8f
const PAGES = ['/', '/tools', '/projects'] as const

export default function SwipeableLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const currentIndex = PAGES.indexOf(pathname as typeof PAGES[number])
    const touchStartX = useRef(0)
    const touchStartY = useRef(0)
    const touchDeltaX = useRef(0)
    const isNavigating = useRef(false)
    const isHorizontalSwipe = useRef(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // \u30da\u30fc\u30b8\u9077\u79fb\u6642\u306e\u30d5\u30a7\u30fc\u30c9\u30a4\u30f3\u30a2\u30cb\u30e1\u30fc\u30b7\u30e7\u30f3
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.opacity = '0'
            containerRef.current.style.transform = 'translateY(6px)'
            containerRef.current.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out'
            requestAnimationFrame(() => {
                if (containerRef.current) {
                    containerRef.current.style.opacity = '1'
                    containerRef.current.style.transform = 'translateY(0)'
                }
            })
        }
    }, [pathname])

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (currentIndex === -1 || isNavigating.current) return
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
        touchDeltaX.current = 0
        isHorizontalSwipe.current = false
    }, [currentIndex])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (currentIndex === -1 || isNavigating.current) return
        const deltaX = e.touches[0].clientX - touchStartX.current
        const deltaY = e.touches[0].clientY - touchStartY.current

        // \u6700\u521d\u306e10px\u3067\u6a2a\u30b9\u30af\u30ed\u30fc\u30eb\u304b\u7e26\u30b9\u30af\u30ed\u30fc\u30eb\u304b\u3092\u5224\u5b9a
        if (!isHorizontalSwipe.current && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return

        if (!isHorizontalSwipe.current) {
            if (Math.abs(deltaY) > Math.abs(deltaX)) return // \u7e26\u30b9\u30af\u30ed\u30fc\u30eb\u512a\u5148
            isHorizontalSwipe.current = true
            if (containerRef.current) {
                containerRef.current.style.transition = 'none'
            }
        }

        if (!isHorizontalSwipe.current) return

        touchDeltaX.current = deltaX

        // \u6307\u306b\u8ffd\u5f93\u3057\u3066\u30b3\u30f3\u30c6\u30f3\u30c4\u3092\u52d5\u304b\u3059
        if (containerRef.current) {
            let adjustedDelta = deltaX
            // \u7aef\u30da\u30fc\u30b8\u3067\u306f\u62b5\u6297\u611f
            if ((currentIndex === 0 && deltaX > 0) || (currentIndex === PAGES.length - 1 && deltaX < 0)) {
                adjustedDelta = deltaX * 0.2
            }
            containerRef.current.style.transform = `translateX(${adjustedDelta}px)`
            containerRef.current.style.opacity = String(Math.max(0.3, 1 - Math.abs(adjustedDelta) / 500))
        }
    }, [currentIndex])

    const handleTouchEnd = useCallback(() => {
        if (currentIndex === -1 || isNavigating.current || !isHorizontalSwipe.current) {
            isHorizontalSwipe.current = false
            return
        }

        const delta = touchDeltaX.current
        const threshold = 60

        if (containerRef.current) {
            containerRef.current.style.transition = 'transform 0.18s ease-out, opacity 0.18s ease-out'
        }

        if (delta < -threshold && currentIndex < PAGES.length - 1) {
            isNavigating.current = true
            if (containerRef.current) {
                containerRef.current.style.transform = 'translateX(-80px)'
                containerRef.current.style.opacity = '0'
            }
            setTimeout(() => {
                router.push(PAGES[currentIndex + 1])
                isNavigating.current = false
            }, 120)
        } else if (delta > threshold && currentIndex > 0) {
            isNavigating.current = true
            if (containerRef.current) {
                containerRef.current.style.transform = 'translateX(80px)'
                containerRef.current.style.opacity = '0'
            }
            setTimeout(() => {
                router.push(PAGES[currentIndex - 1])
                isNavigating.current = false
            }, 120)
        } else {
            // \u95be\u5024\u672a\u6e80 \u2192 \u5143\u306b\u623b\u3059
            if (containerRef.current) {
                containerRef.current.style.transform = 'translateX(0)'
                containerRef.current.style.opacity = '1'
            }
        }

        isHorizontalSwipe.current = false
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
