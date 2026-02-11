import { motion } from "framer-motion"

export function MotionNavIndicator() {
  return (
    <motion.span
      layoutId="bubble"
      className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-primary md:-top-2 md:bottom-auto"
      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
    />
  )
}

