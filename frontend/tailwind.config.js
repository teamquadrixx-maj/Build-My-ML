/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F1E7',
        surface: '#FFFCF5',
        ink: '#1F1B16',
        muted: '#7A7064',
        hairline: '#E4DCCB',
        terracotta: '#B5532F',
        moss: '#5C7A4B',
        mossTint: '#E9EFE2',
      },
      fontFamily: {
        serif: ['Newsreader', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        warm: '0 1px 3px rgba(31, 27, 22, 0.04), 0 6px 16px -4px rgba(31, 27, 22, 0.05)',
      },
    },
  },
  plugins: [],
}

