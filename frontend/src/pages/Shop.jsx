import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import Seo from '../components/Seo.jsx'
import { shopCategories, shopProducts, STORE_WHATSAPP_NUMBER } from '../config/shop.js'
import { useCart } from '../context/useCart.js'
import {
  buildWhatsAppOrderMessage,
  createWhatsAppOrderUrl,
  formatRupees,
  isWhatsAppNumberConfigured,
} from '../utils/whatsappOrder.js'
import '../shop.css'

const emptyCustomer = {
  name: '',
  mobile: '',
  address: '',
  city: '',
  pin: '',
  notes: '',
}

function ProductCard({ product, onAdd }) {
  const [size, setSize] = useState('')
  const [color, setColor] = useState(product.colors[0])
  const [imageFailed, setImageFailed] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (!size) return
    onAdd(product, size, color)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <article className="demo-product-card" id={product.id}>
      <div className="demo-product-image">
        {!imageFailed ? (
          <img
            alt={product.alt}
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={product.image}
          />
        ) : (
          <div className="demo-image-fallback" role="img" aria-label={product.alt}>
            <span>MBF / {product.category}</span>
            <strong>{product.name}</strong>
          </div>
        )}
        <span className="demo-product-category">{product.category}</span>
      </div>
      <div className="demo-product-info">
        <div className="demo-product-heading">
          <h3>{product.name}</h3>
          <strong>{formatRupees(product.price)}</strong>
        </div>
        <details className="demo-product-details">
          <summary>Product details</summary>
          <p>{product.description}</p>
        </details>
        <div className="demo-product-options">
          <label>
            Size
            <select value={size} onChange={(event) => setSize(event.target.value)}>
              <option value="">Choose size</option>
              {product.sizes.map((productSize) => (
                <option key={productSize} value={productSize}>
                  {productSize}
                </option>
              ))}
            </select>
          </label>
          <label>
            Color
            <select value={color} onChange={(event) => setColor(event.target.value)}>
              {product.colors.map((productColor) => (
                <option key={productColor} value={productColor}>
                  {productColor}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="demo-add-button"
          disabled={!size}
          onClick={handleAdd}
          type="button"
        >
          {added ? 'Added to cart ✓' : size ? 'Add to cart +' : 'Select a size'}
        </button>
      </div>
    </article>
  )
}

function CartLines({ cart, onChangeQuantity, onRemove }) {
  if (!cart.length) {
    return (
      <div className="demo-empty-cart">
        <span aria-hidden="true">＋</span>
        <h3>Your cart is waiting</h3>
        <p>Pick a style, choose your size, and add it here.</p>
        <a href="#shop-products">Browse collection</a>
      </div>
    )
  }

  return (
    <ul className="demo-cart-lines">
      {cart.map((item) => (
        <li className="demo-cart-line" key={item.cartId}>
          <div className="demo-cart-line-info">
            <strong>{item.name}</strong>
            <span>
              {item.size} · {item.color}
            </span>
            <span>{formatRupees(item.price)} each</span>
          </div>
          <div className="demo-cart-line-actions">
            <div aria-label={`Quantity for ${item.name}`} className="demo-quantity-control">
              <button
                aria-label={`Decrease ${item.name} quantity`}
                onClick={() => onChangeQuantity(item.cartId, -1)}
                type="button"
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                aria-label={`Increase ${item.name} quantity`}
                onClick={() => onChangeQuantity(item.cartId, 1)}
                type="button"
              >
                +
              </button>
            </div>
            <button
              className="demo-remove-button"
              onClick={() => onRemove(item.cartId)}
              type="button"
            >
              Remove
            </button>
          </div>
          <strong className="demo-line-total">
            {formatRupees(item.price * item.quantity)}
          </strong>
        </li>
      ))}
    </ul>
  )
}

function CheckoutForm({ cart, subtotal }) {
  const [customer, setCustomer] = useState(emptyCustomer)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (cart.length) {
      setErrors((current) => ({ ...current, cart: '' }))
    }
  }, [cart.length])

  const updateCustomer = (event) => {
    const { name, value } = event.target
    setCustomer((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setNotice('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    const mobileDigits = customer.mobile.replace(/\D/g, '')
    const normalizedMobile =
      mobileDigits.length === 12 && mobileDigits.startsWith('91')
        ? mobileDigits.slice(2)
        : mobileDigits

    if (!customer.name.trim()) nextErrors.name = 'Enter your name.'
    if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
      nextErrors.mobile = 'Enter a valid 10-digit Indian mobile number.'
    }
    if (!customer.address.trim()) nextErrors.address = 'Enter your delivery address.'
    if (!customer.city.trim()) nextErrors.city = 'Enter your city.'
    if (!/^\d{6}$/.test(customer.pin.trim())) {
      nextErrors.pin = 'Enter a valid 6-digit PIN code.'
    }
    if (!cart.length) nextErrors.cart = 'Add at least one product before checkout.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setNotice('Please check the highlighted details before continuing.')
      return
    }

    if (!isWhatsAppNumberConfigured(STORE_WHATSAPP_NUMBER)) {
      setNotice(
        'WhatsApp is not configured yet. Add the store number in src/config/shop.js to enable this demo step.',
      )
      return
    }

    const orderMessage = buildWhatsAppOrderMessage({
      customer: { ...customer, mobile: normalizedMobile },
      cart,
      subtotal,
      shopOrigin: window.location.origin,
    })
    window.open(
      createWhatsAppOrderUrl(STORE_WHATSAPP_NUMBER, orderMessage),
      '_blank',
      'noopener,noreferrer',
    )
    setNotice(
      'Continue in WhatsApp: review the prefilled message and press Send to submit your order. The store has not received it yet. If WhatsApp did not open, allow pop-ups and try again.',
    )
  }

  return (
    <form className="demo-checkout-form" onSubmit={handleSubmit} noValidate>
      <div className="demo-checkout-fields">
        <label className="demo-field">
          Customer name
          <input
            aria-describedby={errors.name ? 'demo-name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            name="name"
            onChange={updateCustomer}
            value={customer.name}
          />
          {errors.name && <span className="demo-field-error" id="demo-name-error">{errors.name}</span>}
        </label>
        <label className="demo-field">
          Mobile number
          <input
            aria-describedby={errors.mobile ? 'demo-mobile-error' : undefined}
            aria-invalid={Boolean(errors.mobile)}
            autoComplete="tel"
            inputMode="tel"
            name="mobile"
            onChange={updateCustomer}
            placeholder="10-digit Indian mobile number"
            value={customer.mobile}
          />
          {errors.mobile && <span className="demo-field-error" id="demo-mobile-error">{errors.mobile}</span>}
        </label>
        <label className="demo-field demo-field-wide">
          Delivery address
          <textarea
            aria-describedby={errors.address ? 'demo-address-error' : undefined}
            aria-invalid={Boolean(errors.address)}
            autoComplete="street-address"
            name="address"
            onChange={updateCustomer}
            rows="3"
            value={customer.address}
          />
          {errors.address && <span className="demo-field-error" id="demo-address-error">{errors.address}</span>}
        </label>
        <label className="demo-field">
          City
          <input
            aria-describedby={errors.city ? 'demo-city-error' : undefined}
            aria-invalid={Boolean(errors.city)}
            autoComplete="address-level2"
            name="city"
            onChange={updateCustomer}
            value={customer.city}
          />
          {errors.city && <span className="demo-field-error" id="demo-city-error">{errors.city}</span>}
        </label>
        <label className="demo-field">
          PIN code
          <input
            aria-describedby={errors.pin ? 'demo-pin-error' : undefined}
            aria-invalid={Boolean(errors.pin)}
            autoComplete="postal-code"
            inputMode="numeric"
            maxLength="6"
            name="pin"
            onChange={updateCustomer}
            value={customer.pin}
          />
          {errors.pin && <span className="demo-field-error" id="demo-pin-error">{errors.pin}</span>}
        </label>
        <label className="demo-field demo-field-wide">
          Notes <span className="demo-optional">(optional)</span>
          <textarea
            name="notes"
            onChange={updateCustomer}
            placeholder="Anything else the store should know?"
            rows="2"
            value={customer.notes}
          />
        </label>
      </div>
      {errors.cart && <p className="demo-field-error" role="alert">{errors.cart}</p>}
      {notice && (
        <p
          aria-live="polite"
          className={`demo-checkout-notice${notice.startsWith('Continue') ? ' is-ready' : ''}`}
          role="status"
        >
          {notice}
        </p>
      )}
      {!isWhatsAppNumberConfigured(STORE_WHATSAPP_NUMBER) && (
        <p className="demo-config-warning">
          Demo setup: add the store WhatsApp number in <code>src/config/shop.js</code>.
          Use country code and digits only (example format: 91XXXXXXXXXX).
        </p>
      )}
      <button className="demo-submit-order" disabled={!cart.length} type="submit">
        Submit order on WhatsApp <span aria-hidden="true">↗</span>
      </button>
      <p className="demo-whatsapp-disclaimer">
        WhatsApp opens with a draft message. You must press Send there; this demo cannot confirm delivery.
      </p>
    </form>
  )
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('All')
  const { cart, itemCount, subtotal, addToCart, changeQuantity, removeFromCart } = useCart()
  const visibleProducts = useMemo(
    () =>
      activeCategory === 'All'
        ? shopProducts
        : shopProducts.filter((product) => product.category === activeCategory),
    [activeCategory],
  )

  return (
    <>
      <Seo
        description="Shop sample MBF Stores streetwear styles and prepare an order to send on WhatsApp."
        title="Shop"
      />
      <Navbar />
      <main className="demo-shop-page">
        <section aria-labelledby="shop-title" className="demo-shop-intro">
          <p className="eyebrow">MBF STORES / ONLINE DEMO</p>
          <h1 id="shop-title">Find your <span>fit.</span></h1>
          <p>Pick your pieces. Choose your size. Send your order straight to us on WhatsApp.</p>
          <span className="demo-intro-note">Sample products &amp; prices for demonstration</span>
        </section>

        <div className="demo-shopping-layout">
          <section aria-labelledby="shop-products-title" className="demo-products-section" id="shop-products">
            <div className="demo-section-heading">
              <div>
                <p className="eyebrow">The line-up</p>
                <h2 id="shop-products-title">Shop the collection</h2>
              </div>
              <span>{visibleProducts.length} styles</span>
            </div>
            <div aria-label="Filter products by category" className="demo-category-filters">
              {shopCategories.map((category) => (
                <button
                  aria-pressed={activeCategory === category}
                  className={activeCategory === category ? 'is-active' : ''}
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="demo-product-grid">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} onAdd={addToCart} product={product} />
              ))}
            </div>
          </section>

          <aside aria-labelledby="demo-cart-title" className="demo-cart-panel">
            <div className="demo-cart-heading">
              <div>
                <p className="eyebrow">Your picks</p>
                <h2 id="demo-cart-title">Shopping cart</h2>
              </div>
              <span className="demo-cart-badge">{itemCount}</span>
            </div>
            <CartLines
              cart={cart}
              onChangeQuantity={changeQuantity}
              onRemove={removeFromCart}
            />
            {cart.length > 0 && (
              <>
                <div className="demo-cart-total">
                  <span>Subtotal</span>
                  <strong>{formatRupees(subtotal)}</strong>
                </div>
                <div className="demo-cart-total demo-cart-total-grand">
                  <span>Total</span>
                  <strong>{formatRupees(subtotal)}</strong>
                </div>
                <a className="demo-checkout-link" href="#shop-checkout">
                  Continue to checkout <span aria-hidden="true">↓</span>
                </a>
              </>
            )}
          </aside>
        </div>

        <section aria-labelledby="demo-checkout-title" className="demo-checkout" id="shop-checkout">
          <div className="demo-checkout-heading">
            <p className="eyebrow">Almost yours</p>
            <h2 id="demo-checkout-title">Delivery &amp; checkout</h2>
            <p>Review your order and share delivery details before opening WhatsApp.</p>
          </div>
          <div className="demo-checkout-layout">
            <div className="demo-order-summary">
              <h3>Order summary</h3>
              {cart.length ? (
                <ul>
                  {cart.map((item) => (
                    <li key={item.cartId}>
                      <span>
                        <strong>{item.name}</strong>
                        <small>
                          Size {item.size} · {item.color} · Qty {item.quantity} ×{' '}
                          {formatRupees(item.price)}
                        </small>
                      </span>
                      <strong>{formatRupees(item.price * item.quantity)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="demo-summary-empty">
                  Your order summary will appear here. <Link to="/shop">Browse the collection</Link>.
                </p>
              )}
              <div className="demo-summary-total">
                <span>Subtotal</span>
                <strong>{formatRupees(subtotal)}</strong>
              </div>
              <div className="demo-summary-total demo-summary-grand">
                <span>Total</span>
                <strong>{formatRupees(subtotal)}</strong>
              </div>
              <p className="demo-pricing-note">Sample prices · No delivery fee is calculated in this demo.</p>
            </div>
            <div className="demo-delivery-panel">
              <h3>Your delivery details</h3>
              <CheckoutForm cart={cart} subtotal={subtotal} />
            </div>
          </div>
        </section>
        <div className="demo-flow-note">
          <span>01 Browse</span><i aria-hidden="true" />
          <span>02 Choose size</span><i aria-hidden="true" />
          <span>03 Checkout</span><i aria-hidden="true" />
          <span>04 Send on WhatsApp</span>
        </div>
      </main>
      <Footer />
    </>
  )
}
