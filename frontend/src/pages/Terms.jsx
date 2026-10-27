import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import Seo from '../components/Seo.jsx'

export default function Terms() {
  return (
    <>
      <Seo title="Terms" />
      <Navbar />
      <main className="legal-page">
        <p className="eyebrow">The important details</p>
        <h1>Terms &amp; conditions</h1>
        <p>
          This is a placeholder terms page for MBF Stores. Website information
          is provided for general reference and may change as store details and
          collection availability are updated.
        </p>
      </main>
      <Footer />
    </>
  )
}
