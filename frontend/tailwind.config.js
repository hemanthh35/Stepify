/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#FAFAFA',
        surfaceMuted: '#F5F5F5',
        ink: '#2D3436',
        line: '#E0E0E0',
        accent: '#7C3AED',
        accentMuted: '#A78BFA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
