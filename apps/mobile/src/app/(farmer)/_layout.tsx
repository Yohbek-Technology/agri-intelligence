import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Home, Sprout, ScanLine, CloudSun, Mic } from 'lucide-react-native';
import { TopBar } from '@/components/TopBar';
import { VoiceBar } from '@/components/VoiceBar';
import { useTranslation } from '@/i18n';

export default function FarmerTabsLayout() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      <View style={styles.container}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#16A34A',
            tabBarInactiveTintColor: '#71717A',
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabBarLabel,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: t('nav.home'),
              tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="farms"
            options={{
              title: t('nav.myFarms'),
              tabBarIcon: ({ color, size }) => <Sprout size={size || 22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="diagnose"
            options={{
              title: t('nav.diagnose'),
              tabBarIcon: ({ color, size }) => <ScanLine size={size || 22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="weather"
            options={{
              title: t('nav.weather'),
              tabBarIcon: ({ color, size }) => <CloudSun size={size || 22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="voice-box"
            options={{
              title: t('nav.voiceBox'),
              tabBarIcon: ({ color, size }) => <Mic size={size || 22} color={color} />,
            }}
          />
        </Tabs>
      </View>
      <VoiceBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#E2DBD0',
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});

