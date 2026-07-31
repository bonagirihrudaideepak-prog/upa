/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#6c6a6a',
        'cream-paper': '#fbf8f6',
        'pure-white': '#ffffff',
        'ink-black': '#000000',
        charcoal: '#333333',
        smoke: '#6c6a6a',
        ash: '#dadada',
        'butter-highlight': '#f1f29f',
      },
      fontFamily: {
        serif: ['Libre Caslon Text', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['64px', { lineHeight: '1.1', fontWeight: '400', letterSpacing: '-0.02em' }],
        'display-md': ['48px', { lineHeight: '1.15', fontWeight: '400', letterSpacing: '-0.02em' }],
        'headline-xl': ['40px', { lineHeight: '1.2', fontWeight: '400', letterSpacing: '-0.01em' }],
        'headline-lg': ['32px', { lineHeight: '1.25', fontWeight: '400', letterSpacing: '-0.01em' }],
        'headline-md': ['28px', { lineHeight: '1.3', fontWeight: '400', letterSpacing: '0em' }],
        'headline-sm': ['24px', { lineHeight: '1.3', fontWeight: '400', letterSpacing: '0em' }],
        'title-lg': ['20px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0em' }],
        'title-md': ['18px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0em' }],
        'title-sm': ['16px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0em' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '0em' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '0em' }],
        'body-sm': ['14px', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '0em' }],
        'label-lg': ['14px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.04em' }],
        'label-md': ['12px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.04em' }],
        'label-sm': ['11px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.06em' }],
        'caption': ['12px', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0em' }],
      },
      spacing: {
        'base': '8px',
        'gutter': '24px',
        'margin': '40px',
      },
      maxWidth: {
        'container': '1280px',
      },
      borderRadius: {
        DEFAULT: '2px',
        'lg': '4px',
        'xl': '8px',
        'full': '12px',
      },
      boxShadow: {
        'none': 'none',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
      },
    },
  },
  plugins: [],
};
