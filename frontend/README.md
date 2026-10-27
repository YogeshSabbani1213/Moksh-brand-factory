# MBF Stores frontend

## Run locally

```bash
npm install
npm run dev
```

Open the local address printed by Vite. Create a production build with `npm run build`.

## Project map

- `src/config/brand.js` — brand name, tagline, city, links, description, colors, categories, `HERO_MODE`, and `FRAME_COUNT`.
- `src/data/items.js` — collection item names, categories, image paths, and alt text.
- `src/components/` — navigation, footer, SEO tags, and the loading shutter.
- `src/sections/` — home hero, collection, and store visit sections.
- `src/pages/` — home, privacy, terms, and not-found routes.
- `src/hooks/useSmoothScroll.js` — Lenis and GSAP ScrollTrigger connection.
- `src/index.css` and `tailwind.config.js` — global styles, responsive layout, and Tailwind color tokens.
- `public/media/` — storefront, logo, and product images.

Change the store text, links, categories, WhatsApp phone number, and `HERO_MODE` in `src/config/brand.js`. Change collection cards in `src/data/items.js`; the colors are mapped into Tailwind in `tailwind.config.js`. Set `HERO_MODE` to `frames` to use scroll-controlled images from `public/frames/d/` and `public/frames/m/`; the storefront photo remains as a fallback. Until a phone number is added, the order button opens Instagram DM.

## Images to prepare

| File or pattern | Recommended size | Notes |
| --- | ---: | --- |
| `public/media/hero/shop-front.jpg` | 2400 × 1600 px | Landscape storefront photo; keep the yellow shutters and entry visible near the lower center. |
| `public/media/logo/mbf-logo-white.png` | 800 × 300 px | Transparent white logo; currently the header uses a text placeholder. |
| `public/media/things/upperwear/shirt.webp` | 1200 × 1500 px | Portrait product photo with consistent framing. |
| `public/media/things/upperwear/t-shirt.webp` | 1200 × 1500 px | Portrait product photo with consistent framing. |
| `public/media/things/bottomwear/jeans.webp` | 1200 × 1500 px | Portrait product photo with consistent framing. |
| `public/media/things/bottomwear/cargo.webp` | 1200 × 1500 px | Portrait product photo with consistent framing. |
| `public/media/things/footwear/sneakers.webp` | 1200 × 1500 px | Portrait product photo with consistent framing. |
| `public/media/things/footwear/slides.webp` | 1200 × 1500 px | Portrait product photo with consistent framing. |
| `public/frames/d/001.webp` ... `public/frames/d/120.webp` | 1920 x 1080 px | Optional desktop walk-in sequence; update `FRAME_COUNT` in `brand.js` if needed. |
| `public/frames/m/001.webp` ... `public/frames/m/120.webp` | 1080 x 1920 px | Optional mobile walk-in sequence. |

Product photos can be added later; styled placeholders are shown until then. No backend or API is used.
