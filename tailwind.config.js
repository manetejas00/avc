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
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
        '3xl': '1920px',
      },
      fontFamily: {
        sans: ['Onest', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'fluid-h1': ['clamp(1.875rem, 1.45rem + 1.8vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'fluid-h2': ['clamp(1.625rem, 1.35rem + 1.2vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'fluid-h3': ['clamp(1.375rem, 1.2rem + 0.8vw, 1.625rem)', { lineHeight: '1.3', letterSpacing: '-0.015em', fontWeight: '600' }],
        'fluid-h4': ['clamp(1.125rem, 1rem + 0.6vw, 1.375rem)', { lineHeight: '1.4', fontWeight: '600' }],
        'fluid-body': ['1rem', { lineHeight: '1.6' }],
        'fluid-secondary': ['0.875rem', { lineHeight: '1.5' }],
        'fluid-button': ['clamp(0.875rem, 0.85rem + 0.2vw, 1rem)', { lineHeight: '1.25', fontWeight: '600' }],
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      padding: {
        'section': '96px',
        'section-tablet': '64px',
        'section-mobile': '40px',
        'container': '16px'
      },
      maxWidth: {
        'container': '1280px',
      },
      borderRadius: {
        'card': '24px'
      }
    },
  },
  plugins: [],
}
