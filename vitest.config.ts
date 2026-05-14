import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const workspaceRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(workspaceRoot, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: false,
    setupFiles: ['./src/test/setupVitest.ts'],
  },
})
