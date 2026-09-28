/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        petroleum: {
          navy: '#163B45',
          dark: '#0F272E',
          deep: '#123038',
          light: '#25505C'
        },
        sand: {
          warm: '#D8C5A3',
          light: '#EFE7DA',
          muted: '#C4B08C',
          dark: '#9E8865'
        },
        desert: {
          beige: '#F4EFE6',
          pale: '#FAF7F2',
          surface: '#EDE6DA'
        },
        cream: {
          soft: '#FAF9F5',
          light: '#FCFBF8'
        },
        teal: {
          muted: '#4F8585',
          dark: '#3A6767',
          light: '#6FA4A4',
          subtle: '#E8F1F1'
        },
        sage: {
          green: '#789681',
          light: '#9BB4A3',
          pale: '#EEF4F0',
          dark: '#587360'
        },
        amber: {
          copper: '#B77B45',
          warm: '#D6955B',
          pale: '#F9F1E8',
          dark: '#945F30'
        },
        alert: {
          red: '#C25450',
          pale: '#FBF0EF',
          dark: '#9F3A36'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(22, 59, 69, 0.04), 0 1px 2px rgba(22, 59, 69, 0.02)',
        'soft': '0 4px 14px rgba(22, 59, 69, 0.06), 0 1px 3px rgba(22, 59, 69, 0.04)',
        'soft-lg': '0 10px 25px rgba(22, 59, 69, 0.08), 0 3px 6px rgba(22, 59, 69, 0.04)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(22, 59, 69, 0.05)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
