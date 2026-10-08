/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        // TradeLearn Color Palette
        'tradelearn': {
          'gold': '#FFC107',      // Amarillo/Oro
          'navy': '#0F1B3C',      // Azul marino oscuro
          'blue': '#3B7FD1',      // Azul cielo
          'dark': '#001D3D',      // Azul marino muy oscuro
          'accent': '#FFB300',    // Amarillo más oscuro
        },
      },
    },
  },
  plugins: [],
};
