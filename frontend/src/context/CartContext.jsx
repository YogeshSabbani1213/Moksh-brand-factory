import { useEffect, useState } from 'react'
import { CartContext } from './cartContext.js'

const CART_STORAGE_KEY = 'mbf-demo-cart'

function readSavedCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')
    return Array.isArray(savedCart) ? savedCart : []
  } catch (error) {
    console.error('Could not read the saved MBF demo cart.', error)
    return []
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readSavedCart)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Could not save the MBF demo cart in this browser.', error)
    }
  }, [cart])

  const addToCart = (product, size, color) => {
    const cartId = `${product.id}-${size}-${color}`
    setCart((current) => {
      const existing = current.find((item) => item.cartId === cartId)
      if (existing) {
        return current.map((item) =>
          item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { ...product, cartId, size, color, quantity: 1 }]
    })
  }

  const changeQuantity = (cartId, amount) => {
    setCart((current) =>
      current.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item,
      ),
    )
  }

  const removeFromCart = (cartId) => {
    setCart((current) => current.filter((item) => item.cartId !== cartId))
  }

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const value = { cart, itemCount, subtotal, addToCart, changeQuantity, removeFromCart }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
