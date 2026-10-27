import { useCallback, useState } from 'react'
import { brand } from '../config/brand.js'
import Footer from '../components/Footer.jsx'
import LoadingShutter from '../components/LoadingShutter.jsx'
import Navbar from '../components/Navbar.jsx'
import Seo from '../components/Seo.jsx'
import Collection from '../sections/Collection.jsx'
import HeroIntro from '../sections/HeroIntro.jsx'
import Visit from '../sections/Visit.jsx'

export default function Home() {
  const [frameProgress, setFrameProgress] = useState(0)
  const [showLoader, setShowLoader] = useState(
    () => !sessionStorage.getItem('mbf-intro-shown'),
  )
  const finishLoading = useCallback(() => setShowLoader(false), [])

  return (
    <>
      <Seo />
      {showLoader && (
        <LoadingShutter onComplete={finishLoading} progress={frameProgress} />
      )}
      <Navbar />
      <main>
        <HeroIntro isReady={!showLoader} onProgress={setFrameProgress} />
        <Collection />
        <Visit />
      </main>
      <Footer />
      <span className="sr-only">{brand.name}</span>
    </>
  )
}
