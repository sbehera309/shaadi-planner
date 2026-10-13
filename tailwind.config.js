/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: '#FDF2F2',
          100: '#FDE8E8',
          200: '#FBD5D5',
          300: '#F8B4B4',
          400: '#F98080',
          500: '#E02424',
          600: '#C81E1E',
          700: '#9B1C1C',
          800: '#771D1D',
          900: '#5F1414',
        },
        gold: {
          50: '#FAF8ED',
          100: '#F6F1D5',
          200: '#EDE2A9',
          300: '#E4D27C',
          400: '#DBC350',
          500: '#D4AF37', // Classic Royal Gold
          600: '#B89326',
          700: '#91721C',
          800: '#6E5515',
          900: '#523E0E',
        },
        marigold: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        emerald: {
          850: '#064438',
          950: '#03261F',
        },
        ivory: '#FDFBF7',
      },
      fontFamily: {
        serif: ['var(--font-cinzel)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
