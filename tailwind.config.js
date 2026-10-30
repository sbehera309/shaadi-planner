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
        sans: ['var(--font-sans)', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['var(--font-serif)', '"Playfair Display"', 'Georgia', 'serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slideInLeft 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 3s infinite linear',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float-gentle': 'floatGentle 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
