import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

const alias = { '@': resolve(__dirname, './src') }

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['dotenv/config'],
    testTimeout: 120000,
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts'],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'integration',
          include: ['test/integration/**/*.test.ts'],
          pool: 'forks',
          poolOptions: {
            forks: { singleFork: true },
          },
        },
      },
    ],
  },
})
