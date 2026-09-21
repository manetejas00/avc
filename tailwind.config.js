/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(212 175 55 / <alpha-value>)",
        "primary-hover": "rgb(244 214 117 / <alpha-value>)",
        
        background: "rgb(5 5 5 / <alpha-value>)",
        surface: "rgb(13 13 13 / <alpha-value>)",
        "surface-elevated": "rgb(17 17 17 / <alpha-value>)",
        
        "gold-primary": "rgb(212 175 55 / <alpha-value>)",
        "gold-secondary": "rgb(244 214 117 / <alpha-value>)",
        "gold-muted": "rgb(184 150 46 / <alpha-value>)",
        
        "green-primary": "rgb(16 185 129 / <alpha-value>)",
        "green-secondary": "rgb(5 150 105 / <alpha-value>)",
        
        text: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)"
        },
        border: "var(--border-subtle)",
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
