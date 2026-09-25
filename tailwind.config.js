/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff4ee',
          100: '#ffe5d8',
          200: '#ffc8ae',
          300: '#ff9e78',
          400: '#ff7c4e',
          500: '#ff5b1f',
          600: '#ef4f16',
          700: '#dc4310',
          800: '#b63a11',
          900: '#913216',
        },
      },
    },
  },
  plugins: [],
}
