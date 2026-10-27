import { Link } from 'react-router-dom'
import { brand } from '../config/brand.js'

export default function Footer() {
  return (
    <footer className="site-footer">
      <p className="footer-tagline">{brand.tagline}</p>
      <div className="footer-grid">
        <div>
          <h2>Visit</h2>
          <a href={brand.mapsUrl} target="_blank" rel="noreferrer">
            Google Maps ↗
          </a>
          <p>{brand.city}</p>
        </div>
        <div>
          <h2>Follow</h2>
          <a href={brand.instagramUrl} target="_blank" rel="noreferrer">
            Instagram ↗
          </a>
        </div>
        <div>
          <h2>Legal</h2>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Designed &amp; built by {brand.designer}</span>
        <span>© 2026 {brand.name}</span>
      </div>
    </footer>
  )
}
