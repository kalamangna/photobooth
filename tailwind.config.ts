import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue',
    './node_modules/flowbite/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'Courier New', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: 'hsl(36, 100%, 55%)',
          dim:     'hsl(36, 80%, 45%)',
          soft:    'hsl(36, 100%, 55%, 0.12)',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        xl: '28px',
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
} satisfies Config
