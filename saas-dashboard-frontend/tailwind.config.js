/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
        display: ['Space Grotesk', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.06)',
        'soft-lg': '0 24px 60px rgba(15, 23, 42, 0.1)',
      },
    },
  },
  plugins: [],
}
