import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { brand } from '../config/brand.js'

gsap.registerPlugin(ScrollTrigger)

function drawFrame(canvas, image, failed = false) {
  if (!canvas) return
  const context = canvas.getContext('2d')
  if (!context) return
  if (failed) {
    canvas.style.opacity = '0'
    context.clearRect(0, 0, canvas.width, canvas.height)
    return
  }

  const bounds = canvas.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  const widthAtPixelRatio = bounds.width * ratio
  const heightAtPixelRatio = bounds.height * ratio
  if (canvas.width !== widthAtPixelRatio || canvas.height !== heightAtPixelRatio) {
    canvas.width = widthAtPixelRatio
    canvas.height = heightAtPixelRatio
  }
  const scale = Math.max(canvas.width / image.width, canvas.height / image.height)
  const width = image.width * scale
  const height = image.height * scale
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(
    image,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height,
  )
  canvas.style.opacity = '1'
}

function requestFrame(index, canvas, cache, currentFrame) {
  const key = String(index).padStart(3, '0')
  const folder = window.innerWidth <= 768 ? 'm' : 'd'
  const cacheKey = `${folder}-${index}`
  const image = new Image()
  image.onload = () => {
    if (currentFrame.current === cacheKey) drawFrame(canvas, image)
  }
  // The background photo stays visible when a requested frame is missing.
  image.onerror = () => {
    if (currentFrame.current === cacheKey) drawFrame(canvas, null, true)
  }
  image.src = `/frames/${folder}/${key}.webp`
  cache.set(cacheKey, image)
}

function getFrameCacheKey(index) {
  const folder = window.innerWidth <= 768 ? 'm' : 'd'
  return `${folder}-${index}`
}

function SocialIcon({ label, href, className = '', children }) {
  return (
    <a
      aria-label={label}
      className={`hero-social ${className}`.trim()}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  )
}

export default function Hero({ isReady }) {
  const heroRef = useRef(null)
  const frameCache = useRef(new Map())
  const currentFrame = useRef('')

  useLayoutEffect(() => {
    const root = heroRef.current
    if (!root) return undefined
    if (!isReady) return undefined

    const context = gsap.context(() => {
      const photo = root.querySelector('.hero-photo')
      const visual = root.querySelector('.hero-visual')
      const introShade = root.querySelector('.hero-intro-shade')
      const copy = root.querySelector('.hero-copy')
      const kicker = root.querySelector('.hero-copy .eyebrow')
      const headline = root.querySelector('.hero-copy h1')
      const location = root.querySelector('.hero-location')
      const socials = root.querySelector('.hero-socials')
      const scrollHint = root.querySelector('.hero-scroll')
      const progress = root.querySelector('.hero-progress span')
      const canvas = root.querySelector('.frames-canvas')
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (reducedMotion) {
        gsap.set([visual, copy, kicker, headline, location, socials, scrollHint], {
          opacity: 1,
          y: 0,
          scale: 1,
        })
        gsap.set(introShade, { opacity: 0 })
      } else {
        gsap.set([kicker, headline, location, socials, scrollHint], {
          opacity: 0,
          y: 28,
        })
        gsap.set(introShade, { opacity: 0.5 })
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .fromTo(visual, { opacity: 0.7 }, { opacity: 1, duration: 1.4 }, 0)
          .to(introShade, { opacity: 0, duration: 1.4 }, 0)
          .to(kicker, { opacity: 1, y: 0, duration: 0.75 }, 0.18)
          .to(headline, { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }, 0.3)
          .to(location, { opacity: 1, y: 0, duration: 0.65 }, 0.5)
          .to(socials, { opacity: 1, y: 0, duration: 0.65 }, 0.62)
          .to(scrollHint, { opacity: 1, y: 0, duration: 0.65 }, 0.72)
      }

      if (!reducedMotion && brand.HERO_MODE === 'image') {
        // Use one scrubbed timeline so the zoom and text always share progress.
        const scrollAnimation = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=165%',
            scrub: 0.7,
            pin: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
          .fromTo(
            photo,
            { scale: 1, transformOrigin: '55% 75%' },
            { scale: 2.05, ease: 'none', immediateRender: false },
            0,
          )
          .fromTo(
            copy,
            { yPercent: 0, opacity: 1 },
            { yPercent: -24, opacity: 0, ease: 'none', immediateRender: false },
            0,
          )
          .fromTo(
            socials,
            { y: 0, opacity: 1 },
            { y: -18, opacity: 0, ease: 'none', immediateRender: false },
            0,
          )
          .fromTo(
            scrollHint,
            { opacity: 1 },
            { opacity: 0, ease: 'none', immediateRender: false },
            0,
          )
        if (progress) {
          scrollAnimation.fromTo(
            progress,
            { scaleX: 0 },
            { scaleX: 1, ease: 'none', immediateRender: false },
            0,
          )
        }
      } else if (!reducedMotion && brand.HERO_MODE === 'frames') {
        gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=165%',
            scrub: 0.7,
            pin: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (trigger) => {
              const frame = Math.min(
                brand.FRAME_COUNT,
                Math.max(1, Math.round(trigger.progress * (brand.FRAME_COUNT - 1)) + 1),
              )
              const cacheKey = getFrameCacheKey(frame)
              currentFrame.current = cacheKey
              const cached = frameCache.current.get(cacheKey)
              if (cached?.complete && cached.naturalWidth) {
                drawFrame(canvas, cached)
              } else if (!cached) {
                requestFrame(frame, canvas, frameCache.current, currentFrame)
              }
              gsap.set(copy, {
                yPercent: -35 * trigger.progress,
                opacity: 1 - trigger.progress,
              })
            },
          },
        }).to({}, { duration: 1 })
      }
    }, root)

    return () => context.revert()
  }, [isReady])

  return (
    <section aria-labelledby="hero-title" className="hero" id="hero" ref={heroRef}>
      <div aria-hidden="true" className="hero-visual">
        <div className="hero-photo" />
        {brand.HERO_MODE === 'frames' && (
          <canvas className="frames-canvas" />
        )}
        <div className="hero-shade" />
        <div className="hero-intro-shade" />
      </div>
      <div className="hero-copy">
        <p className="eyebrow">
          <span aria-hidden="true" className="hero-kicker-dot" />
          {brand.tagline}
        </p>
        <h1 id="hero-title">{brand.statement}</h1>
        <p className="hero-location">Independent style / {brand.city}</p>
        <div className="hero-socials">
          <SocialIcon href={brand.mapsUrl} label="Open MBF Stores in Google Maps">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 22s8-7.1 8-13a8 8 0 1 0-16 0c0 5.9 8 13 8 13Z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </SocialIcon>
          <SocialIcon
            className="hero-social--instagram"
            href={brand.instagramUrl}
            label="Visit MBF Stores on Instagram"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <rect height="16" rx="4" width="16" x="4" y="4" />
              <circle cx="12" cy="12" r="3.5" />
              <circle className="icon-dot" cx="17.5" cy="6.8" r="1" />
            </svg>
            <span>Instagram ↗</span>
          </SocialIcon>
        </div>
      </div>
      <div className="hero-progress" aria-hidden="true">
        <span />
      </div>
      <a className="hero-scroll" href="#collection">
        Scroll to enter <span aria-hidden="true">↓</span>
      </a>
    </section>
  )
}
