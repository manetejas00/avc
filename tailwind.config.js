/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#10b981", // Emerald green (BSE UP color) for trust and growth
        "primary-hover": "#059669",
        background: "#020617", // Slate 950 (deep premium dark blue)
        surface: "#0f172a", // Slate 900
        "surface-ii": "#1e293b", // Slate 800
        text: {
          DEFAULT: "#f8fafc",
          muted: "#94a3b8"
        },
        border: "#1e293b",
        neutral: {
          100: "#f1f1f1",
          200: "#ebebef",
          300: "#cacbd4",
          600: "#3e404c",
          700: "#24262d",
        },
        green: "#10b981",
        gold: "#eab308",
      },
      fontFamily: {
        sans: ['Onest', 'sans-serif'],
      },
      padding: {
        'section': '96px',
        'section-tablet': '64px',
        'section-mobile': '32px',
        'container': '12px'
      },
      maxWidth: {
        'container': '1200px',
      },
      borderRadius: {
        'card': '24px'
      }
    },
  },
  plugins: [],
}
