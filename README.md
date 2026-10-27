# MBF Stores

MBF Stores is a front-end-only retail storefront built with React and Vite. It includes a frame-based, scroll-controlled storefront introduction, product-category showcases, store information, and legal pages. There is no backend, database, or live inventory connection.

## Run locally

Use Node.js and npm, then run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite.

Useful commands, run from `frontend/`:

```bash
npm run lint       # Check the frontend with ESLint
npm run build      # Create a production build in frontend/dist/
npm run preview    # Preview the production build locally
```

## Project structure

```text
frontend/
├── public/
│   ├── frames/
│   │   ├── d/                 # Desktop hero frames
│   │   └── m/                 # Mobile hero frames
│   └── media/
│       ├── hero/              # Storefront poster
│       └── video/             # Source video for generating frames
├── scripts/
│   └── make-frames.mjs        # Generates WebP frame sequences with FFmpeg
└── src/
    ├── components/            # Navbar, footer, SEO, and loading shutter
    ├── config/                # Brand settings and hero frame counts
    ├── data/                  # Local sample product data
    ├── hooks/                 # Smooth scrolling and frame preloading
    ├── pages/                 # Home, privacy, terms, and 404 pages
    └── sections/              # Hero intro, collection, and visit sections
```

## Where to make changes

- **Brand name, copy, links, location, and colors:** `frontend/src/config/brand.js`
- **Product names, categories, sample prices, ratings, and image paths:** `frontend/src/data/items.js`
- **Hero frame totals and public paths:** `frontend/src/config/heroFrames.json`
- **Hero, collection, and visit behavior:** `frontend/src/sections/`
- **Shared layout and global responsive styles:** `frontend/src/components/` and `frontend/src/index.css`
- **Tailwind theme colors:** `frontend/tailwind.config.js`

The collection currently has five showcase entries per type: Shirts, T-Shirts, Pants, Cargo, Sneakers, and Slides. Prices and ratings are illustrative demo data, not verified store inventory or customer reviews. Replace them with confirmed details before publishing. Until a store phone number is added to `brand.js`, the **Click to order** links open MBF Stores' Instagram.

## Hero frames

The scroll intro uses 200 desktop frames and 120 mobile frames, configured in `heroFrames.json`. To regenerate them, make sure FFmpeg is installed and the source video exists at `frontend/public/media/video/intro_mbf.mp4`, then run:

```bash
cd frontend
npm run frames
```

This recreates `public/frames/d/` and `public/frames/m/` and updates the frame counts. The existing storefront poster at `public/media/hero/shop-front.jpg` is used behind the frames as a fallback.

## Routes

- `/` — Storefront home
- `/privacy` — Privacy information placeholder
- `/terms` — Terms placeholder
- Any unknown route — Not-found page

All product data and interactions are local front-end examples. Connect a backend and replace the showcase prices, ratings, and order links before using them as real commerce information.