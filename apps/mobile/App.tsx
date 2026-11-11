// Note: AgrIntel mobile uses Expo Router file-based routing via apps/mobile/src/app/_layout.tsx.
// This App.tsx is retained as a typed placeholder for non-router tooling and test harnesses.
import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>AgrIntel Mobile (Expo Router Entry)</Text>
    </View>
  );
}

