/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B0F14',
          raised: '#141A22',
          card: '#1A212B',
          border: '#242C38',
        },
        brand: {
          teal: '#1FD1C1',
          tealDark: '#0FA89A',
          indigo: '#4C4CE0',
          indigoDark: '#3634A3',
          yellow: '#FFC93C',
        },
        text: {
          primary: '#F4F6F8',
          secondary: '#A7B0BD',
          muted: '#6B7482',
        },
        status: {
          keep: '#2FD1A3',
          review: '#FFC93C',
          downgrade: '#5FA8FF',
          cancelSoon: '#FF7A5C',
          paused: '#8A93A3',
          cancelled: '#4B515C',
          danger: '#FF5C5C',
        },
      },
      borderRadius: {
        xl: '18px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
