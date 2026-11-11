import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  define: {
    __DEV__: 'true',
  },
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@repo/domain', replacement: path.resolve(__dirname, '../../packages/domain/src') },
      { find: 'react-native', replacement: 'react-native-web' },
      { find: 'react-native-svg', replacement: path.resolve(__dirname, './__tests__/mocks/react-native-svg.ts') },
      { find: 'lucide-react-native', replacement: path.resolve(__dirname, './__tests__/mocks/lucide-react-native.ts') },
      { find: 'expo-modules-core', replacement: path.resolve(__dirname, './__tests__/mocks/expo-modules-core.ts') },
      { find: 'expo-secure-store', replacement: path.resolve(__dirname, './__tests__/mocks/expo-secure-store.ts') },
      { find: 'expo-speech', replacement: path.resolve(__dirname, './__tests__/mocks/expo-speech.ts') },
    ],
  },
});
