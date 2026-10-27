import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { brand } from '../config/brand.js'
import { items } from '../data/items.js'
import { setSmoothScrollPaused } from '../hooks/useSmoothScroll.js'

gsap.registerPlugin(ScrollTrigger)

const productTypes = [...new Set(items.map((item) => item.type))]

function ProductTypeCard({ type, item, index, onView }) {
  const [imageFailed, setImageFailed] = useState(false)
  const cardRef = useRef(null)
  const typeItems = items.filter((product) => product.type === type)

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const tween = gsap.fromTo(
      card,
      { y: 32, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        delay: (index % 3) * 0.08,
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      },
    )
    return () => tween.kill()
  }, [index])

  return (
    <article className="collection-card" ref={cardRef}>
      <button
        aria-label={`View ${type} products`}
        className="product-open"
        onClick={() => onView(type)}
        type="button"
      >
        <div className="product-art">
          {!imageFailed ? (
            <img
              alt={`${type} styles from the MBF Stores ${item.category} collection`}
              height="760"
              loading="lazy"
              onError={() => setImageFailed(true)}
              src={item.image}
              width="600"
            />
          ) : (
            <div aria-label={`${type} collection`} className="product-placeholder" role="img">
              <span className="placeholder-code">MBF / {String(index + 1).padStart(2, '0')}</span>
              <span className="placeholder-name">{type}</span>
              <span className="placeholder-category">{item.category}</span>
            </div>
          )}
          <span aria-hidden="true" className="product-view-hint">
            View {type} <span>↗</span>
          </span>
        </div>
        <div className="product-caption">
          <h3>{type}</h3>
          <p>{typeItems.length} sample styles</p>
        </div>
      </button>
    </article>
  )
}

function Rating({ rating, reviewCount }) {
  return (
    <div aria-label={`Rated ${rating} out of 5 from ${reviewCount} sample reviews`} className="sample-rating">
      <span aria-hidden="true">★★★★★</span>
      <strong>{rating}</strong>
      <small>({reviewCount})</small>
    </div>
  )
}

function getOrderUrl(item) {
  if (brand.phone) {
    const message = encodeURIComponent(`Hi MBF Stores, I would like to order ${item.name}.`)
    return `https://wa.me/${brand.phone}?text=${message}`
  }
  return brand.instagramUrl
}

function ShopTab({ type, onClose }) {
  const dialogRef = useRef(null)
  const [failedImages, setFailedImages] = useState({})
  const products = items.filter((item) => item.type === type)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !type) return undefined

    if (!dialog.open) dialog.showModal()
    setSmoothScrollPaused(true)

    // Pause page smoothing so wheel and touch input scroll only this dialog.
    return () => setSmoothScrollPaused(false)
  }, [type])

  useLayoutEffect(() => {
    setFailedImages({})
  }, [type])

  return (
    <dialog
      aria-labelledby="shop-tab-title"
      className="shop-tab"
      onClose={() => {
        setSmoothScrollPaused(false)
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current.close()
      }}
      onTouchMove={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
      ref={dialogRef}
    >
      {type && (
        <>
          <header className="shop-tab-header">
            <div>
              <p className="eyebrow">MBF Stores / Shop by style</p>
              <h2 id="shop-tab-title">{type}</h2>
              <p className="shop-tab-count">{products.length} showcase products</p>
            </div>
            <button
              aria-label="Close product list"
              className="product-dialog-close"
              onClick={() => dialogRef.current.close()}
              type="button"
            >
              ×
            </button>
          </header>
          <div className="shop-product-grid">
            {products.map((item, index) => (
              <article className="shop-product-card" key={item.id}>
                <div className="shop-product-image">
                  {!failedImages[item.id] ? (
                    <img
                      alt={item.alt}
                      loading="lazy"
                      onError={() => setFailedImages((current) => ({ ...current, [item.id]: true }))}
                      src={item.image}
                    />
                  ) : (
                    <div aria-label={item.alt} className="product-placeholder" role="img">
                      <span className="placeholder-code">MBF / {String(index + 1).padStart(2, '0')}</span>
                      <span className="placeholder-name">{item.name}</span>
                      <span className="placeholder-category">{type}</span>
                    </div>
                  )}
                  <span className="sample-product-tag">Showcase</span>
                </div>
                <div className="shop-product-info">
                  <p className="shop-product-category">{item.category}</p>
                  <h3>{item.name}</h3>
                  <Rating rating={item.rating} reviewCount={item.reviewCount} />
                  <p className="shop-product-price">{item.price}</p>
                  <a
                    className="button button-primary shop-order-button"
                    href={getOrderUrl(item)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Click to order ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="shop-tab-note">
            Prices and ratings are sample showcase details. Contact the store to confirm availability.
          </p>
        </>
      )}
    </dialog>
  )
}

export default function Collection() {
  const marqueeItems = [...brand.categories, ...brand.categories]
  const [selectedType, setSelectedType] = useState(null)

  return (
    <section aria-labelledby="collection-title" className="collection section-pad" id="collection">
      <div className="section-heading">
        <p className="eyebrow">Made for your everyday</p>
        <h2 id="collection-title">Our collection</h2>
      </div>
      <div aria-label="Shop categories" className="marquee" role="group">
        <div className="marquee-track">
          {marqueeItems.map((category, index) => (
            <span
              aria-hidden={index >= brand.categories.length}
              className={index % 2 ? 'marquee-word outlined' : 'marquee-word'}
              key={`${category.name}-${index}`}
            >
              {category.name}
              <span className="marquee-dot">✳</span>
            </span>
          ))}
        </div>
      </div>
      <div className="collection-grid">
        {productTypes.map((type, index) => (
          <ProductTypeCard
            index={index}
            item={items.find((item) => item.type === type)}
            key={type}
            onView={setSelectedType}
            type={type}
          />
        ))}
      </div>
      <ShopTab
        onClose={() => setSelectedType(null)}
        type={selectedType}
      />
    </section>
  )
}
