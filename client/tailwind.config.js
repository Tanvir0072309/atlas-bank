/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FBF1F3",
          100: "#F3DDE3",
          200: "#E3B4C1",
          300: "#CE7E93",
          400: "#B34D69",
          500: "#8B1538", // primary — matches logo mark
          600: "#7A1230",
          700: "#650F27",
          800: "#4A0A1C",
          900: "#320712",
        },
        cream: "#F7F4EF",
        ink: "#241318",
        muted: "#8A7378",
        gold: "#B8892E", // used sparingly — the compass needle / signature accent only
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["'Work Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 20px 50px -20px rgba(50, 7, 18, 0.35)",
      },
    },
  },
  plugins: [],
};
