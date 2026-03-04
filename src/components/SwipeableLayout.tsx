'use client'

import { motion, PanInfo, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'

// BottomNavの順序
const PAGES = ['/', '/tools', '/projects'] as const

export default function SwipeableLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const currentIndex = PAGES.indexOf(pathname as typeof PAGES[number])

    // スワイプ（ドラッグ）終了時の判定
    const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
        if (currentIndex === -1) return // 管理対象外ページでは何もしない

        const swipeThreshold = 50 // 50px以上スワイプしたら遷移
        const swipeVelocity = 500 // または勢いよくスワイプした場合

        const swipeRight = offset.x > swipeThreshold || velocity.x > swipeVelocity // 左へ戻る
        const swipeLeft = offset.x < -swipeThreshold || velocity.x < -swipeVelocity // 右へ進む

        if (swipeLeft && currentIndex < PAGES.length - 1) {
            router.push(PAGES[currentIndex + 1])
        } else if (swipeRight && currentIndex > 0) {
            router.push(PAGES[currentIndex - 1])
        }
    }

    // 対象外ページ（各詳細画面など）では通常のアニメーションのみ
    if (currentIndex === -1) {
        return (
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full min-h-screen"
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
                dragConstraints={{ left: 0, right: 0 }} // 放した後に必ず元の位置に戻ろうとする
                dragElastic={0.4} // 指の動きへの追従度（1で完全追従）
                onDragEnd={handleDragEnd}

                // ページ遷移自体の基本アニメーション
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full h-full min-h-screen touch-pan-y"
            // touch-pan-y: 縦スクロールはブラウザ標準に任せる（誤爆防止）
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
