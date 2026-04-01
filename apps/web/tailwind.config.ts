import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edfcf9',
          100: '#d3f8f1',
          200: '#aaf0e4',
          300: '#72e2d3',
          400: '#3acbbc',
          500: '#1fb0a3',
          600: '#178d84',
          700: '#18716b',
          800: '#195a56',
          900: '#194b48',
          950: '#092d2b',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
