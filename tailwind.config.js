/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        panther: {
          950: '#07080B',
          900: '#0D0F15',
          850: '#12151E',
          800: '#191C28',
          750: '#212536',
          700: '#2C3246',
          600: '#434B67',
        },
        flame: {
          600: '#D93800',
          500: '#FF4D00',
          400: '#FF6B1A',
          300: '#FF8E4D',
        },
        amber: {
          glow: '#FFB800',
          dark: '#B37D00'
        },
        cyber: {
          cyan: '#00F0FF',
          purple: '#A855F7',
          green: '#10B981',
          red: '#EF4444'
        }
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'flame-sm': '0 0 10px rgba(255, 77, 0, 0.3)',
        'flame-md': '0 0 20px rgba(255, 77, 0, 0.45)',
        'flame-lg': '0 0 35px rgba(255, 77, 0, 0.6)',
        'gold-glow': '0 0 25px rgba(255, 184, 0, 0.4)',
        'cyan-glow': '0 0 20px rgba(0, 240, 255, 0.35)',
        'card-dark': '0 8px 30px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'panther-grid': 'linear-gradient(to right, rgba(255, 77, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 77, 0, 0.05) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
