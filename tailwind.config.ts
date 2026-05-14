import type { Config } from 'tailwindcss'

/**
 * Tailwind v4 sources design tokens from `src/styles/theme.css` via `@theme`.
 * This file remains the canonical config surface for tooling and future plugins.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
} satisfies Config
