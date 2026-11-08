import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'unspecified' ? 'light' : colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.backgroundElement,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) =>
            Platform.OS === 'ios' ? (
              <SymbolView
                name={{ ios: 'house.fill', android: 'home', web: 'home' }}
                size={24}
                tintColor={color}
              />
            ) : (
              <Image
                source={require('@/assets/images/tabIcons/home.png')}
                style={[styles.tabIcon, { tintColor: color }]}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) =>
            Platform.OS === 'ios' ? (
              <SymbolView
                name={{ ios: 'safari.fill', android: 'explore', web: 'explore' }}
                size={24}
                tintColor={color}
              />
            ) : (
              <Image
                source={require('@/assets/images/tabIcons/explore.png')}
                style={[styles.tabIcon, { tintColor: color }]}
              />
            ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
