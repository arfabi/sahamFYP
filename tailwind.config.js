/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        card: "var(--card)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        navy: "var(--navy)",
        "on-navy": "var(--on-navy)",
        gold: "var(--gold)",
        up: "var(--up)",
        down: "var(--down)",
        warn: "var(--warn)",
      },
      fontFamily: {
        head: ["Archivo", "Arial Black", "system-ui", "sans-serif"],
        body: ["IBM Plex Sans", "Inter", "system-ui", "sans-serif"],
        sans: ["IBM Plex Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
        display: ["Archivo", "Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};