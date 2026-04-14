/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#faf7f2',
        surface: '#ffffff',
        ink: { DEFAULT: '#1f2a24', muted: '#6b7468' },
        hairline: '#e8e2d6',
        moss: { DEFAULT: '#3d5a47', deep: '#2a4132' },
        clay: '#b8654a',
        butter: '#f3e9c7',
        sage: '#d8e0cf',
        rose: '#ecd4cc',
        danger: '#a04848',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.12em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30,40,35,0.04)',
        lift: '0 10px 30px rgba(30,40,35,0.06)',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
    },
  },
  plugins: [],
};
