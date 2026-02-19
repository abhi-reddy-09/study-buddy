import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register plugins once, only in the browser
if (typeof window !== "undefined" && !gsap.core.globals().ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }

