/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16A34A',
          dark: '#15803D',
          light: '#DCFCE7',
        },
        earth: {
          50: '#FAF8F4',
          100: '#F4EFE6',
          200: '#DFD9CB',
        },
        soil: {
          koticha: '#27272A',
          beda: '#9A3412',
          amber: '#C78326',
        },
      },
      minHeight: {
        'touch-target': '56px',
      },
      minWidth: {
        'touch-target': '56px',
      },
    },
  },
  plugins: [],
};

