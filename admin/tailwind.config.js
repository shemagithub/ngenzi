/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6f3',
          100: '#dcebe3',
          200: '#b9d7c7',
          300: '#8bbba3',
          400: '#5d977d',
          500: '#3d7a5f',
          600: '#2d5f4a',
          700: '#1b3a2f',
          800: '#163029',
          900: '#122620',
          950: '#0a1612',
        },
        haven: {
          50: '#eff6f3',
          100: '#dcebe3',
          200: '#b9d7c7',
          300: '#8bbba3',
          400: '#5d977d',
          500: '#3d7a5f',
          600: '#2d5f4a',
          700: '#1b3a2f',
          800: '#163029',
          900: '#122620',
          950: '#0a1612',
        },
        cream: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f7f5f0',
          300: '#efeae2',
          400: '#e8e0d5',
          500: '#d4c9b8',
        },
        accent: {
          50: '#faf6f0',
          100: '#f3ebe0',
          200: '#e8d9c4',
          300: '#d4b896',
          400: '#c4a574',
          500: '#b08d55',
          600: '#967544',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(18, 38, 32, 0.06)',
        panel: '0 1px 0 rgba(18, 38, 32, 0.04), 0 12px 32px rgba(18, 38, 32, 0.08)',
      },
      borderRadius: {
        panel: '1rem',
      },
    },
  },
  plugins: [],
};
