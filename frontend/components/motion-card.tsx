"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { ReactNode } from "react"

interface MotionCardProps {
  children: ReactNode
  id: string
  swipingDirection: "left" | "right" | null
}

export function MotionCard({ children, id, swipingDirection }: MotionCardProps) {
  const isExiting = swipingDirection !== null

  return (
    <AnimatePresence mode="popLayout">
      {!isExiting && (
        <motion.div
          key={id}
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -12 }}
          transition={{ type: "spring", bounce: 0.25, duration: 0.45 }}
          className="relative"
        >
          {children}
        </motion.div>
      )}
      {isExiting && (
        <motion.div
          key={`${id}-exit`}
          initial={{ scale: 1, opacity: 1, x: 0, rotate: 0 }}
          animate={{
            x: swipingDirection === "left" ? -320 : 320,
            opacity: 0,
            rotate: swipingDirection === "left" ? -12 : 12,
          }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="relative"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
