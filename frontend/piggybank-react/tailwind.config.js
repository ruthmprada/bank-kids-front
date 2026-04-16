/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0846ed",
        "on-primary": "#f2f1ff",
        "primary-container": "#859aff",

        secondary: "#00694d",
        "secondary-container": "#60fcc6",
        "on-secondary": "#c7ffe4",

        tertiary: "#785500",
        "tertiary-container": "#feb700",

        background: "#f9f5ff",
        "on-background": "#2b2a51",

        surface: "#f9f5ff",
        "surface-container": "#e9e5ff",
        "surface-container-high": "#e2dfff",
        "surface-container-highest": "#dcd9ff",

        "on-surface": "#2b2a51",
        "on-surface-variant": "#585781",

        error: "#b41340",
      },

      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
      },

      fontFamily: {
        headline: ["Plus Jakarta Sans"],
        body: ["Be Vietnam Pro"],
      },
    },
  },
  plugins: [],
};