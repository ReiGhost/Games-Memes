/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        beige: {
          50:  '#FDFAF2',
          100: '#F9F0DC',
          200: '#F2E2BC',
          300: '#EAD09A',
          400: '#DEBA78',
          500: '#D4A855',
        },
        ninja: {
          red:       '#7A1515',
          'red-mid': '#9E2020',
          'red-lit': '#C0392B',
          gold:      '#C9A227',
          'gold-lt': '#E8C84A',
          'gold-dk': '#8A6D10',
          brown:     '#1E0D07',
          'brown-m': '#4A2015',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        lora:   ['Lora', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
