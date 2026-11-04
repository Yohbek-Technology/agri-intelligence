import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

const alias = { '@': resolve(__dirname, './src') }

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['dotenv/config'],
    testTimeout: 120000,
    hookTimeout: 60000,
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts'],
          testTimeout: 30000,
          hookTimeout: 30000,
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'integration',
          include: ['test/integration/**/*.test.ts'],
          testTimeout: 60000,
          hookTimeout: 60000,
          pool: 'forks',
          poolOptions: {
            forks: { singleFork: true },
          },
        },
      },
    ],
  },
})
