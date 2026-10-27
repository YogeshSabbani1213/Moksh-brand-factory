import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { brand } from '../config/brand.js'
import { scrollToSection } from '../hooks/useSmoothScroll.js'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const updateNav = () => setIsScrolled(window.scrollY > 24)
    window.addEventListener('scroll', updateNav, { passive: true })
    updateNav()
    return () => window.removeEventListener('scroll', updateNav)
  }, [])

  return (
    <header className={`site-nav${isScrolled ? ' is-scrolled' : ''}`}>
      <Link aria-label={`${brand.name} home`} className="nav-brand" to="/">
        <span className="brand-mark">MBF</span>
        <span className="brand-name">STORES</span>
      </Link>
      <nav aria-label="Main navigation" className="nav-links">
        <a
          href="/#collection"
          onClick={(event) => {
            if (location.pathname === '/') {
              event.preventDefault()
              scrollToSection('#collection')
            }
          }}
        >
          Collection
        </a>
        <a
          href="/#visit"
          onClick={(event) => {
            if (location.pathname === '/') {
              event.preventDefault()
              scrollToSection('#visit')
            }
          }}
        >
          Visit
        </a>
      </nav>
    </header>
  )
}
