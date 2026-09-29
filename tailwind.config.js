/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Inter',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          50: '#eaf3ff',
          100: '#d2e7ff',
          200: '#a8cfff',
          300: '#6facff',
          400: '#3585ff',
          500: '#0071e3',
          600: '#0060c4',
          700: '#0050a2',
          800: '#004184',
          900: '#003366',
        },
        ink: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#d9d9de',
          300: '#b8b9c0',
          400: '#8f9099',
          500: '#6e6f79',
          600: '#565760',
          700: '#46474f',
          800: '#3a3b42',
          900: '#1c1d21',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        lift: '0 4px 12px rgba(16,24,40,0.08), 0 1px 3px rgba(16,24,40,0.04)',
        pop: '0 12px 32px rgba(16,24,40,0.14), 0 2px 8px rgba(16,24,40,0.06)',
      },
      borderRadius: {
        xl2: '18px',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn .25s ease both',
        slideUp: 'slideUp .28s cubic-bezier(.22,1,.36,1) both',
        scaleIn: 'scaleIn .2s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
};
