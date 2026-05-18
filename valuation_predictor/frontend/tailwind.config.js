/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#0A0A0A',
        'secondary-surface': '#161616',
        'brand-accent': '#E50914',
        'muted-highlight': '#9B050C',
        'text-primary': '#F5F5F7',
        'text-muted': '#A1A1AA',
        'border-default': '#262626',
      },
      boxShadow: {
        'accent-glow': '0 0 8px rgba(229, 9, 20, 0.4)',
      },
    },
  },
  plugins: [],
};
