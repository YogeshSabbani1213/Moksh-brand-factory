import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { brand } from '../config/brand.js'

gsap.registerPlugin(ScrollTrigger)

export default function Visit() {
  const cardRef = useRef(null)

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const image = card.querySelector('img')
    const tween = gsap.fromTo(
      image,
      { scale: 1.14 },
      {
        scale: 1,
        duration: 1.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 82%', once: true },
      },
    )
    return () => tween.kill()
  }, [])

  return (
    <section aria-labelledby="visit-title" className="visit section-pad" id="visit">
      <div className="visit-copy">
        <p className="eyebrow">Visit the store</p>
        <h2 id="visit-title">
          {brand.city}
          <span aria-hidden="true" className="asterisk">*</span>
        </h2>
        <p className="visit-description">{brand.description}</p>
        <div className="visit-actions">
          <a className="button button-primary" href={brand.mapsUrl} rel="noreferrer" target="_blank">
            Get directions ↗
          </a>
          <a
            className="button button-outline"
            href={brand.phone ? `https://wa.me/${brand.phone}` : brand.instagramUrl}
            rel="noreferrer"
            target="_blank"
          >
            WhatsApp / DM to order ↗
          </a>
        </div>
      </div>
      <a
        aria-label={`Open ${brand.name} in Google Maps`}
        className="store-card"
        href={brand.mapsUrl}
        ref={cardRef}
        rel="noreferrer"
        target="_blank"
      >
        <img
          alt="MBF Stores storefront with yellow rolling shutters and a glass upper floor"
          height="560"
          loading="lazy"
          src="/media/hero/shop-front.jpg"
          width="900"
        />
        <div className="store-card-shade" />
        <div className="store-card-info">
          <div>
            <h3>{brand.name}</h3>
            <p>{brand.city}</p>
          </div>
          <span>Open in Google Maps ↗</span>
        </div>
      </a>
    </section>
  )
}
