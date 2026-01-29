/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'whatsapp': {
          'green': '#25D366',
          'dark-green': '#128C7E',
          'light-green': '#DCF8C6',
          'blue': '#34B7F1',
          'bg': '#111B21',
          'bg-light': '#202C33',
          'bg-chat': '#0B141A',
          'border': '#2A3942',
          'text': '#E9EDEF',
          'text-secondary': '#8696A0',
        }
      }
    },
  },
  plugins: [],
}
