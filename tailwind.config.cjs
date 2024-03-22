const typography = require('@tailwindcss/typography');

module.exports = {
  content: ['entrypoints/**/*.{html,ts,vue}', 'components/**/*.ts'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        dimmed: {
          100: '#cdd9e5',
          200: '#d0d7de',
          700: '#444c56',
          800: '#2d333b',
          900: '#1c2128',
        },
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            h1: {
              marginTop: '1.3em',
            },
            li: {
              margin: 0,
            },
            img: {
              margin: 'auto',
              borderRadius: theme('borderRadius.lg'),
            },
            'code::before': {
              content: '',
            },
            'code::after': {
              content: '',
            },
          },
        },
      }),
    },
  },
  darkMode: 'media',
  plugins: [typography],
};
