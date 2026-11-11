import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function IndexRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/language" />;
  }

  if (user?.status === 'PENDING') {
    return <Redirect href="/(auth)/pending" />;
  }

  if (user?.role === 'DA') {
    return <Redirect href="/(da)/farmers" />;
  }

  return <Redirect href="/(farmer)" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F4',
  },
});

