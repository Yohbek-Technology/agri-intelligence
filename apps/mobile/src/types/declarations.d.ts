/**
 * Ambient type declarations
 * Ensures IDE language servers seamlessly resolve Expo packages whose
 * package.json `exports` omit direct `types` subpath mappings.
 */

declare module 'expo-splash-screen' {
  export * from 'expo-splash-screen/build/index';
}

