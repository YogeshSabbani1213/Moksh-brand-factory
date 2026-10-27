import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const HERO_IMAGE = '/media/hero/shop-front.jpg'

export default function LoadingShutter({ onComplete, progress = 0 }) {
  const [posterReady, setPosterReady] = useState(false)
  const hasFinished = useRef(false)

  useEffect(() => {
    const image = new Image()
    image.onload = () => {
      setPosterReady(true)
    }
    image.onerror = () => {
      console.error(`The hero image could not be loaded: ${HERO_IMAGE}`)
      setPosterReady(true)
    }
    image.src = HERO_IMAGE

    return () => {
      image.onload = null
      image.onerror = null
      image.src = ''
    }
  }, [])

  useEffect(() => {
    if (!posterReady || progress < 100 || hasFinished.current) return undefined

    let animation
    const timer = window.setTimeout(() => {
      hasFinished.current = true
      const quickMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      const shutter = document.querySelector('.loading-shutter')
      if (!shutter) {
        onComplete()
        return
      }

      // Wait for the real frame preload so the intro does not reveal a blank canvas.
      animation = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem('mbf-intro-shown', 'true')
          onComplete()
        },
      })
        .to(shutter, {
          yPercent: -102,
          duration: quickMotion ? 0.01 : 1.05,
          ease: 'power4.inOut',
        })
        .to(shutter, {
          yPercent: -100,
          duration: quickMotion ? 0.01 : 0.2,
          ease: 'bounce.out',
        })
    }, 220)

    return () => {
      window.clearTimeout(timer)
      animation?.kill()
    }
  }, [onComplete, posterReady, progress])

  return (
    <div aria-label={`Loading ${progress}%`} className="loading-shutter" role="status">
      <div className="shutter-lines" />
      <p>
        Loading <span>{String(progress).padStart(3, '0')}%</span>
      </p>
    </div>
  )
}
