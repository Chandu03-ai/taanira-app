/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'rich-brown': '#4A3F36',
        'soft-gold': '#DEC9A3',
        'subtle-beige': '#F2ECE4',
        'mocha': '#8F6C43',
        'rose-sand': '#E5CFB5',
        'linen': '#F6F5F1',
        'burntumber': '#804000',
        'champagne': '#D4B896',
        'coal': '#1C1A17',
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
};
