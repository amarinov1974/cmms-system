/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        urgent: {
          DEFAULT: '#dc2626',
          light: '#fef2f2',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
        },
      },
    },
  },
  plugins: [],
}
