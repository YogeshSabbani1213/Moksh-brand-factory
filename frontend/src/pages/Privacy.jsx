import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import Seo from '../components/Seo.jsx'

export default function Privacy() {
  return (
    <>
      <Seo title="Privacy" />
      <Navbar />
      <main className="legal-page">
        <p className="eyebrow">The important details</p>
        <h1>Privacy policy</h1>
        <p>
          This is a placeholder privacy policy for MBF Stores. This website is a
          front-end experience and does not currently collect or store personal
          information. Contact the store directly with questions about privacy.
        </p>
      </main>
      <Footer />
    </>
  )
}
