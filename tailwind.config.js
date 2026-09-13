/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff661a",
        background: "black",
        surface: "#121212",
        "surface-ii": "#161616",
        text: {
          DEFAULT: "#ffffff",
          muted: "#b9b9b9"
        },
        border: "#181818",
        neutral: {
          100: "#f1f1f1",
          200: "#ebebef",
          300: "#cacbd4",
          600: "#3e404c",
          700: "#24262d",
        },
        green: "#3ebb7f",
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
