import React from 'react';
import { Stack } from 'expo-router';

export default function FarmersStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Farmer Roster' }} />
      <Stack.Screen name="multi-farmer" options={{ title: 'Multi-Farmer Mode' }} />
    </Stack>
  );
}

