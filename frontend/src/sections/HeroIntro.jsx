import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { brand } from '../config/brand.js'
import { useFramePreloader } from '../hooks/useFramePreloader.js'

gsap.registerPlugin(ScrollTrigger)

const SETTINGS = {
  SCROLL_LENGTH: '+=500%',
  WHITE: '#f4f1ea',
  NEXT_BG: brand.colors.background,
  POSTER: '/media/hero/shop-front.jpg',
  BATCH_SIZE: 8,
}

function drawCover(canvas, image) {
  if (!canvas || !image?.naturalWidth) return
  const bounds = canvas.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return

  // A capped pixel ratio keeps the canvas crisp without using too much phone memory.
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const width = Math.round(bounds.width * pixelRatio)
  const height = Math.round(bounds.height * pixelRatio)
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }

  const context = canvas.getContext('2d')
  if (!context) return
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.clearRect(0, 0, bounds.width, bounds.height)

  const scale = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight)
  const imageWidth = image.naturalWidth * scale
  const imageHeight = image.naturalHeight * scale
  context.drawImage(
    image,
    (bounds.width - imageWidth) / 2,
    (bounds.height - imageHeight) / 2,
    imageWidth,
    imageHeight,
  )
}

function findClosestFrame(frameSet, frameNumber, count) {
  const exactFrame = frameSet.images.get(frameNumber)
  if (exactFrame?.complete && exactFrame.naturalWidth) {
    return { frameNumber, image: exactFrame }
  }

  // Missing frames use the nearest loaded image while the poster stays underneath.
  for (let distance = 1; distance < count; distance += 1) {
    const before = frameSet.images.get(frameNumber - distance)
    if (before?.complete && before.naturalWidth) {
      return { frameNumber: frameNumber - distance, image: before }
    }
    const after = frameSet.images.get(frameNumber + distance)
    if (after?.complete && after.naturalWidth) {
      return { frameNumber: frameNumber + distance, image: after }
    }
  }
  return null
}

function SocialLink({ label, href, children }) {
  return (
    <a
      aria-label={label}
      className="hero-intro-social"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  )
}

export default function HeroIntro({ isReady, onProgress }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const requestedFrame = useRef(1)
  const lastDrawnFrame = useRef(-1)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  )
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const { count, firstFrameReady, framesRef } = useFramePreloader(
    isMobile ? 'mobile' : 'desktop',
    onProgress,
    !reducedMotion,
    { batchSize: SETTINGS.BATCH_SIZE },
  )

  useEffect(() => {
    const viewport = window.matchMedia('(max-width: 767px)')
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateViewport = () => setIsMobile(viewport.matches)
    const updateMotion = () => setReducedMotion(motionPreference.matches)

    viewport.addEventListener('change', updateViewport)
    motionPreference.addEventListener('change', updateMotion)
    return () => {
      viewport.removeEventListener('change', updateViewport)
      motionPreference.removeEventListener('change', updateMotion)
    }
  }, [])

  const renderFrame = useCallback(
    (frameNumber) => {
      const canvas = canvasRef.current
      const frameSet = framesRef.current
      if (!canvas || frameSet.mode !== (isMobile ? 'mobile' : 'desktop')) return

      const roundedFrame = Math.max(1, Math.min(count, Math.round(frameNumber)))
      requestedFrame.current = roundedFrame
      const nearest = findClosestFrame(frameSet, roundedFrame, count)
      if (!nearest || nearest.frameNumber === lastDrawnFrame.current) return
      drawCover(canvas, nearest.image)
      canvas.style.opacity = '1'
      lastDrawnFrame.current = nearest.frameNumber
    },
    [count, framesRef, isMobile],
  )

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !firstFrameReady || !isReady) return undefined

    const canvas = canvasRef.current
    let active = true
    let refreshTimer
    const frameSet = framesRef.current
    const redrawCurrentFrame = () => {
      renderFrame(requestedFrame.current)
    }
    const resizeCanvas = () => {
      lastDrawnFrame.current = -1
      redrawCurrentFrame()
    }
    frameSet.listeners.add(redrawCurrentFrame)
    const onResize = () => {
      window.clearTimeout(refreshTimer)
      resizeCanvas()
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    }
    window.addEventListener('resize', onResize, { passive: true })

    // Fonts can change the hero height, so refresh after they settle.
    document.fonts?.ready.then(() => {
      if (active) ScrollTrigger.refresh()
    })

    const context = gsap.context(() => {
      const content = root.querySelector('.hero-intro-content')
      const revealItems = root.querySelectorAll('.hero-intro-reveal')
      const overlay = root.querySelector('.hero-intro-transition')
      const welcome = root.querySelector('.hero-intro-welcome')
      const playhead = { frame: 0 }

      // Keep the welcome message hidden until the white transition is complete.
      gsap.set(welcome, { autoAlpha: 0, scale: 0.2, color: SETTINGS.NEXT_BG })

      if (reducedMotion) {
        gsap.set([content, revealItems], { autoAlpha: 1, y: 0 })
        if (canvas) canvas.style.opacity = '0'
        return
      }

      const drawCurrentFrame = () => renderFrame(playhead.frame)
      if (frameSet.images.has(1)) {
        drawCurrentFrame()
      }

      // Reveal copy after frame one is ready; the poster remains visible underneath.
      gsap.fromTo(
        revealItems,
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
      )

      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: SETTINGS.SCROLL_LENGTH,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // One timeline ties text, frames, and color together so reverse scroll is natural.
      scrollTimeline
        .to(content, { autoAlpha: 0, y: 36, duration: 0.08, ease: 'none' }, 0)
        .to(
          playhead,
          {
            frame: count - 1,
            duration: 0.75,
            ease: 'none',
            onUpdate: drawCurrentFrame,
          },
          0,
        )
        .fromTo(
          overlay,
          { autoAlpha: 0, backgroundColor: SETTINGS.WHITE },
          { autoAlpha: 1, duration: 0.1, ease: 'none', immediateRender: false },
          0.65,
        )
        .to(
          welcome,
          { autoAlpha: 1, scale: 1, duration: 0.1, ease: 'none' },
          0.75,
        )
        .to(
          welcome,
          {
            scale: () => {
              const { offsetWidth, offsetHeight } = welcome
              if (!offsetWidth || !offsetHeight) return 1
              return (
                Math.max(
                  window.innerWidth / offsetWidth,
                  window.innerHeight / offsetHeight,
                ) * 1.08
              )
            },
            duration: 0.15,
            ease: 'none',
          },
          0.85,
        )
        .to(
          welcome,
          { autoAlpha: 0, duration: 0.02, ease: 'none' },
          0.9,
        )
        .to(
          overlay,
          {
            backgroundColor: SETTINGS.NEXT_BG,
            duration: 0.08,
            ease: 'none',
          },
          0.92,
        )

    }, root)
    ScrollTrigger.refresh()

    return () => {
      active = false
      window.clearTimeout(refreshTimer)
      window.removeEventListener('resize', onResize)
      frameSet.listeners.delete(redrawCurrentFrame)
      context.revert()
      if (canvas) canvas.style.opacity = '0'
      lastDrawnFrame.current = -1
    }
  }, [count, firstFrameReady, framesRef, isReady, reducedMotion, renderFrame])

  return (
    <section
      aria-label="MBF Stores shop introduction"
      className="hero-intro"
      id="hero-intro"
      ref={rootRef}
      style={{ '--hero-next-background': SETTINGS.NEXT_BG }}
    >
      <div aria-hidden="true" className="hero-intro-visual">
        <div
          className="hero-intro-poster"
          style={{ backgroundImage: `url("${SETTINGS.POSTER}")` }}
        />
        <canvas aria-hidden="true" className="hero-intro-canvas" ref={canvasRef} />
        <div className="hero-intro-shade" />
        <div
          aria-hidden="true"
          className="hero-intro-transition"
          style={{ backgroundColor: SETTINGS.WHITE }}
        />
      </div>
      <h2 aria-hidden="true" className="hero-intro-welcome">
        Welcome to our collection
      </h2>
      <div className="hero-intro-content">
        <p className="hero-intro-tagline hero-intro-reveal">{brand.tagline}</p>
        <div className="hero-intro-card hero-intro-reveal">
          <div aria-label={brand.name} className="hero-intro-brand" role="img">
            <span className="hero-intro-brand-mark">MBF</span>
            <span className="hero-intro-brand-name">STORES</span>
          </div>
          <h1>{brand.statement}</h1>
          <p className="hero-intro-location">{brand.city}</p>
          <div className="hero-intro-links">
            <SocialLink href={brand.mapsUrl} label="Open MBF Stores in Google Maps">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12 22s8-7.1 8-13a8 8 0 1 0-16 0c0 5.9 8 13 8 13Z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </SocialLink>
            <SocialLink href={brand.instagramUrl} label="Visit MBF Stores on Instagram">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <rect height="16" rx="4" width="16" x="4" y="4" />
                <circle cx="12" cy="12" r="3.5" />
                <circle cx="17.5" cy="6.8" r="1" />
              </svg>
            </SocialLink>
            <SocialLink
              href={
                brand.phone
                  ? `https://wa.me/${brand.phone}`
                  : 'https://wa.me/?text=Hi%20MBF%20Stores'
              }
              label="Message MBF Stores on WhatsApp"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z" />
                <path d="M9 9.2c.4 2.2 1.6 3.4 3.8 4.1" />
              </svg>
            </SocialLink>
          </div>
        </div>
      </div>
    </section>
  )
}
