/** @type {import('tailwindcss').Config} */
import { nextui } from '@nextui-org/react'
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        monts: ['Montserrat', 'sans-serif'],
        bn: ['Bebas Neue', 'Montserrat', 'sans-serif']
      }
    }
  },
  plugins: [nextui()],
}

