/** @type {import('tailwindcss').Config} */
export default {
  // Zone 2 gebruikt geen Tailwind en wordt bewust niet gescand,
  // zodat er geen utility-klassen ontstaan die met zijn eigen CSS botsen.
  content: [
    './index.html',
    './src/App.jsx',
    './src/main.jsx',
    './src/pages/**/*.{js,jsx}',
    './src/zones/Zone1.jsx',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
