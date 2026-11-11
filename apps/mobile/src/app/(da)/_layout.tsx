import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Users, ClipboardCheck, AlertCircle, Radio, UserCheck } from 'lucide-react-native';
import { TopBar } from '@/components/TopBar';
import { VoiceBar } from '@/components/VoiceBar';
import { useTranslation } from '@/i18n';

export default function DaTabsLayout() {
  const { t } = useTranslation();
  const [activeFarmer, setActiveFarmer] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar activeFarmerName={activeFarmer} />
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
            name="farmers"
            options={{
              title: t('nav.farmers'),
              tabBarIcon: ({ color, size }) => <Users size={size || 22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="review"
            options={{
              title: t('nav.review'),
              tabBarIcon: ({ color, size }) => <ClipboardCheck size={size || 22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="grievances"
            options={{
              title: t('nav.grievances'),
              tabBarIcon: ({ color, size }) => <AlertCircle size={size || 22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="alerts"
            options={{
              title: t('nav.alerts'),
              tabBarIcon: ({ color, size }) => <Radio size={size || 22} color={color} />,
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

