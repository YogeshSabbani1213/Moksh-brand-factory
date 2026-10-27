import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let activeLenis

export function scrollToSection(selector) {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  const target = document.querySelector(selector)

  if (!target) return
  if (activeLenis) {
    activeLenis.scrollTo(target)
  } else {
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }
}

export function setSmoothScrollPaused(paused) {
  if (!activeLenis) return
  if (paused) {
    activeLenis.stop()
  } else {
    activeLenis.start()
  }
}

export function useSmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reducedMotion) return undefined

    const lenis = new Lenis({ autoRaf: false, smoothWheel: true })
    activeLenis = lenis
    const updateScroll = () => ScrollTrigger.update()
    const animateScroll = (time) => lenis.raf(time * 1000)

    // One animation loop keeps Lenis and GSAP in sync.
    lenis.on('scroll', updateScroll)
    gsap.ticker.add(animateScroll)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', updateScroll)
      gsap.ticker.remove(animateScroll)
      lenis.destroy()
      activeLenis = undefined
    }
  }, [])
}
