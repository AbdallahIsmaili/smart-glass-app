/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'primary-black': '#000000',
        'secondary-black': '#0a0a0a',
        'card-black': '#1a1a1a',
        'light-green': '#00ff88',
        'dark-green': '#00cc6a',
        'text-gray': '#888888',
        'text-light-gray': '#cccccc',
      },
    },
  },
  plugins: [],
};