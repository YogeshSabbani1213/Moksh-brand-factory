import { Helmet } from 'react-helmet-async'
import { brand } from '../config/brand.js'

export default function Seo({ title = 'Home', description = brand.description }) {
  const pageTitle = title === 'Home' ? brand.name : `${title} | ${brand.name}`
  const canonicalUrl = `${window.location.origin}${window.location.pathname}`

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content={brand.colors.background} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${window.location.origin}/media/hero/shop-front.jpg`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${window.location.origin}/media/hero/shop-front.jpg`} />
    </Helmet>
  )
}
