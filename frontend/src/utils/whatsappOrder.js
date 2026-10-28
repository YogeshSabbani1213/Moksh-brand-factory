function normalizeWhatsAppNumber(phoneNumber) {
  if (typeof phoneNumber !== 'string' || !/^\+?[\d\s()-]+$/.test(phoneNumber.trim())) {
    return ''
  }

  const digits = phoneNumber.replace(/\D/g, '')
  return /^\d{10,15}$/.test(digits) ? digits : ''
}

export function isWhatsAppNumberConfigured(phoneNumber) {
  return normalizeWhatsAppNumber(phoneNumber) !== ''
}

function getProductUrl(shopOrigin, productId) {
  const productUrl = new URL('/shop', shopOrigin)
  productUrl.hash = productId
  return productUrl.toString()
}

export function buildWhatsAppOrderMessage({ customer, cart, subtotal, shopOrigin }) {
  const lines = [
    'MBF STORES — ORDER REQUEST',
    '',
    `Customer: ${customer.name}`,
    `Customer phone: ${customer.mobile}`,
    `Deliver to: ${customer.address}, ${customer.city} - ${customer.pin}`,
    '',
    'ITEMS',
    ...cart.flatMap((item, index) => [
      `${index + 1}. ${item.name}`,
      `   Size: ${item.size} | Color: ${item.color}`,
      `   Qty: ${item.quantity} x ${formatRupees(item.price)} = ${formatRupees(item.price * item.quantity)}`,
      `   Product link: ${getProductUrl(shopOrigin, item.id)}`,
      '',
    ]),
    `SUBTOTAL: ${formatRupees(subtotal)}`,
    'Delivery: To be confirmed by store',
    '',
    `TOTAL BILL: ${formatRupees(subtotal)}`,
  ]

  if (customer.notes.trim()) {
    lines.push('', `Customer notes: ${customer.notes.trim()}`)
  }

  lines.push('', 'Please confirm product availability and delivery.')
  return lines.join('\n')
}

export function formatRupees(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function createWhatsAppOrderUrl(phoneNumber, message) {
  const normalizedNumber = normalizeWhatsAppNumber(phoneNumber)
  if (!normalizedNumber) {
    throw new Error('A valid WhatsApp number with country code is required.')
  }
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`
}
