/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Body / caption — clean geometric sans-serif, high legibility
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // Headline — heavy display sans (Montserrat ExtraBold/Black)
        display: ["Montserrat", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};