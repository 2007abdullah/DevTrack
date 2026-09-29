/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: { 950: '#0F121A', 900: '#141824', 800: '#1B2030', 700: '#262D42', 600: '#39425E', 500: '#5B6584', 400: '#8B94B0' },
        brand: { 50: '#E9FAF6', 100: '#C9F2E9', 200: '#93E4D3', 300: '#5CD1BB', 400: '#2FBBA2', 500: '#1A9F89', 600: '#128171', 700: '#0F675B' },
      },
      keyframes: {
        rise: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'none' } },
        fill: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.45 } },
      },
      animation: {
        rise: 'rise .6s cubic-bezier(.2,.7,.2,1) both',
        fill: 'fill 1.1s cubic-bezier(.2,.7,.2,1) .5s both',
        pulseSoft: 'pulseSoft 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
