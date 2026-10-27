import { brand } from './src/config/brand.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: brand.colors.background,
        surface: brand.colors.surface,
        foreground: brand.colors.text,
        accent: brand.colors.accent,
        accent2: brand.colors.accent2,
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
