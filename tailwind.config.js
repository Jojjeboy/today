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
        primary: {
          light: '#a7f3d0', // emerald-200 approx
          DEFAULT: 'rgb(51 177 93)', // User provided mint green
          dark: '#10b981', // emerald-500 approx
        }
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
