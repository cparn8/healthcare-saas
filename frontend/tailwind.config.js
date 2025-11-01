/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // scan all React files
  ],
  theme: {
    extend: {
      transitionProperty: {
        'opacity-transform': 'opacity, transform',
      },
      transitionTimingFunction: {
        'soft-in': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'soft-out': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        'toast-enter': {
          '0%': { opacity: '0', transform: 'translateY(-10px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'modal-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'modal-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(20px)' },
        },
      },
      animation: {
        'toast-in': 'toast-in 0.2s ease-out forwards',
        'toast-out': 'toast-out 0.15s ease-in forwards',
        'toast-enter': 'toast-enter 0.25s ease-out',
        'modal-in': 'modal-in 0.25s ease-out forwards',
        'modal-out': 'modal-out 0.2s ease-in forwards',
      },
    },
  },
  plugins: [],
};
