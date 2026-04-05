/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        sienna: {
          50: '#fcf6f4',
          100: '#f9eee8',
          200: '#f1d6ca',
          300: '#e5b6a3',
          400: '#d58c6f',
          500: '#c56a47',
          600: '#ba5534',
          700: '#9b4227',
          800: '#803823',
          900: '#67301f',
        },
        primary: '#d58c6f',
        primaryHover: '#c56a47',
      }
    },
  },
  plugins: [],
}
