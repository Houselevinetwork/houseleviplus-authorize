module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dw-black': '#140D0E',
        'dw-red': '#B33828',
        'dw-grey-96': '#F5F5F5',
        'dw-grey-60': '#999999',
        'dw-grey-56': '#8F8F8F',
      },
      fontFamily: {
        'libre-franklin': ['"Libre Franklin"', 'sans-serif'],
      },
      fontSize: {
        'dw-heading': ['26px', { lineHeight: '1.1', letterSpacing: '-0.78px', fontWeight: '700' }],
        'dw-label': ['18px', { lineHeight: '1.5', letterSpacing: '-0.36px', fontWeight: '600' }],
        'dw-button': ['14px', { lineHeight: '1', letterSpacing: '-0.30px', fontWeight: '700' }],
        'dw-link': ['13px', { lineHeight: '1.62', letterSpacing: '-0.30px', fontWeight: '700' }],
        'dw-tab': ['18px', { lineHeight: '1.5', letterSpacing: '-0.36px', fontWeight: '600' }],
      },
      borderRadius: {
        'dw-input': '8px',
        'dw-button': '64px',
      },
    },
  },
  plugins: [],
}
