/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#090D16',
        container: '#111827',
        border: '#1F2937',
        text: '#F3F4F6',
        accent: {
          primary: '#10B981',
          secondary: '#8B5CF6',
        },
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1200px',
        xl: '1200px',
      },
    },
  },
  plugins: [],
};
