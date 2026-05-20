/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#fe3c72",
          orange: "#ff655b",
          gradient: "linear-gradient(262deg, #ff7854 0%, #fd267d 100%)",
        },
        dark: {
          bg: "#0e1116",
          card: "#161b22",
          border: "#21262d",
          text: "#c9d1d9",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

