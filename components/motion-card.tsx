"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { ReactNode } from "react"

interface MotionCardProps {
  children: ReactNode
  id: string
  swipingDirection: "left" | "right" | null
}

export function MotionCard({ children, id, swipingDirection }: MotionCardProps) {
  return (
    <AnimatePresence>
      <motion.div
        key={id}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          x: swipingDirection === "left" ? -200 : swipingDirection === "right" ? 200 : 0,
        }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        className="relative"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

