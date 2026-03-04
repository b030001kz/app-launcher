'use client'

import { motion, PanInfo, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useRef } from 'react'

// BottomNavの順序
const PAGES = ['/', '/tools', '/projects'] as const

export default function SwipeableLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const currentIndex = PAGES.indexOf(pathname as typeof PAGES[number])
    const isNavigating = useRef(false)

    // スワイプ（ドラッグ）終了時の判定
    const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
        if (currentIndex === -1 || isNavigating.current) return

        const swipeThreshold = 80 // 80px以上スワイプしたら遷移
        const velocityThreshold = 400

        const swipeRight = offset.x > swipeThreshold || velocity.x > velocityThreshold
        const swipeLeft = offset.x < -swipeThreshold || velocity.x < -velocityThreshold

        if (swipeLeft && currentIndex < PAGES.length - 1) {
            isNavigating.current = true
            router.push(PAGES[currentIndex + 1])
            setTimeout(() => { isNavigating.current = false }, 500)
        } else if (swipeRight && currentIndex > 0) {
            isNavigating.current = true
            router.push(PAGES[currentIndex - 1])
            setTimeout(() => { isNavigating.current = false }, 500)
        }
    }

    // 対象外ページ（各詳細画面など）では通常のアニメーションのみ
    if (currentIndex === -1) {
        return (
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="w-full h-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        )
    }

    return (
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
                key={pathname}
                // 指の動きに合わせてX軸をドラッグ可能に
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9} // 指への追従度を高く
                dragMomentum={false} // 慣性を無効化して、離した瞬間に反応
                onDragEnd={handleDragEnd}

                // ページ遷移のアニメーション
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30, transition: { duration: 0.12 } }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="w-full h-full touch-pan-y"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
