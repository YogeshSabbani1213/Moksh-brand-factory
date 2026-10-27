import { Link } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import Seo from '../components/Seo.jsx'

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" />
      <Navbar />
      <main className="legal-page not-found">
        <p className="eyebrow">404 / Page not found</p>
        <h1>Wrong turn.</h1>
        <Link className="button button-primary" to="/">
          Back to home ↗
        </Link>
      </main>
      <Footer />
    </>
  )
}
