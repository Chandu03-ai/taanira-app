/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Global Theme Colors - Change these to update entire site theme
        'theme': {
          'primary': '#4A3F36',      // Main brand color (rich brown)
          'secondary': '#DEC9A3',    // Accent color (soft gold)
          'background': '#FAF9F6',   // Main background (linen)
          'surface': '#F2ECE4',      // Card/surface background (subtle beige)
          'muted': '#8F6C43',        // Muted text (mocha)
          'accent': '#E5CFB5',       // Highlight color (rose sand)
          'dark': '#1C1A17',         // Dark text/elements (coal)
          'light': '#F6F5F1',        // Light backgrounds
        },
        // Legacy color names for backward compatibility
        'rich-brown': 'var(--color-theme-primary)',
        'soft-gold': 'var(--color-theme-secondary)',
        'subtle-beige': 'var(--color-theme-surface)',
        'mocha': 'var(--color-theme-muted)',
        'rose-sand': 'var(--color-theme-accent)',
        'linen': 'var(--color-theme-background)',
        'burntumber': '#804000',
        'champagne': '#D4B896',
        'coal': 'var(--color-theme-dark)',
        'copper': '#AA732F',
        'sand': '#F2E9D8',
        'espresso': '#4F3C2A',
        'bronze': '#AE742B',
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-in-out forwards',
        fadeInSlow: 'fadeInSlow 0.8s ease-out forwards',
        slideInUp: 'slideInUp 0.6s ease-out forwards',
        slideInLeft: 'slideInLeft 0.6s ease-out forwards',
        slideInRight: 'slideInRight 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInSlow: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInUp: {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: 0, transform: 'translateX(-30px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: 0, transform: 'translateX(30px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      aspectRatio: {
        '4/5': '4 / 5',
        '3/4': '3 / 4',
        '5/6': '5 / 6',
      },
    },
  },
  plugins: [],
  corePlugins: {
    // Remove default focus ring styles
    ringWidth: false,
  },
};
