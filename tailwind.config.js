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
        "primary-hover": "rgb(255 255 255 / <alpha-value>)",
        
        background: "rgb(0 0 0 / <alpha-value>)",
        surface: "rgb(15 15 15 / <alpha-value>)",
        "surface-elevated": "rgb(24 24 24 / <alpha-value>)",
        
        "gold-primary": "rgb(212 175 55 / <alpha-value>)",
        "gold-secondary": "rgb(255 255 255 / <alpha-value>)",
        "gold-muted": "rgb(244 214 117 / <alpha-value>)",
        
        "green-primary": "rgb(212 175 55 / <alpha-value>)",
        "green-secondary": "rgb(244 214 117 / <alpha-value>)",
        
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
