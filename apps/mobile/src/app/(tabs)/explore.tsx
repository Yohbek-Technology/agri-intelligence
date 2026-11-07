import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { API_BASE_URL } from '@/lib/config';

export default function ExploreScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; timestamp?: string } | null>(
    null
  );

  const runConnectionTest = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const start = Date.now();
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      const latency = Date.now() - start;
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setTestResult({
          ok: true,
          message: `Connected (${latency}ms) - API Operational`,
          timestamp: data.timestamp || new Date().toISOString(),
        });
      } else {
        setTestResult({
          ok: false,
          message: `Server returned HTTP ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: `Failed to connect to ${API_BASE_URL}: ${err?.message ?? 'Network Error'}`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    default: {
      paddingTop: Spacing.four,
      paddingBottom: insets.bottom,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.titleContainer}>
          <Text style={[styles.heading, { color: theme.text }]}>Agronomy & Extension Library</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Field intelligence reference, regional pest advisory, and backend system health.
          </Text>
        </ThemedView>

        {/* Live Backend Connection Tester Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardHeaderTitle, { color: theme.text }]}>Backend System Link</Text>
              <Text style={[styles.cardHeaderSubtitle, { color: theme.textSecondary }]}>
                {API_BASE_URL}
              </Text>
            </View>
          </View>

          <Pressable
            style={[styles.testButton, { backgroundColor: theme.primary }]}
            disabled={testingConnection}
            onPress={runConnectionTest}>
            {testingConnection ? (
              <ActivityIndicator size="small" color={theme.primaryText} />
            ) : (
              <Text style={[styles.testButtonText, { color: theme.primaryText }]}>Test Server Health</Text>
            )}
          </Pressable>

          {testResult && (
            <View
              style={[
                styles.resultBox,
                {
                  backgroundColor: testResult.ok ? theme.primarySubtle : theme.dangerLight,
                  borderColor: testResult.ok ? theme.primary : theme.danger,
                },
              ]}>
              <Text style={[styles.resultText, { color: testResult.ok ? theme.primary : theme.danger }]}>
                {testResult.ok ? '✅' : '❌'} {testResult.message}
              </Text>
              {testResult.timestamp && (
                <Text style={[styles.resultTimestamp, { color: theme.textSecondary }]}>
                  Server Time: {testResult.timestamp}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Collapsible Agricultural Sections */}
        <ThemedView style={styles.sectionsWrapper}>
          <Collapsible title="🌾 Major Crop Disease Library">
            <ThemedView type="backgroundElement" style={styles.topicCard}>
              <Text style={[styles.topicTitle, { color: theme.text }]}>Wheat Stem Rust (Puccinia graminis)</Text>
              <Text style={[styles.topicBody, { color: theme.textSecondary }]}>
                Symptom: Reddish-brown pustules on stems and leaf sheaths. Most prevalent in central Oromia during humid cycles.
              </Text>
              <Text style={[styles.remedyText, { color: theme.primary }]}>
                Recommended Action: Early fungicide application (Propiconazole) or plant resistant varieties like Kakaba/Danda'a.
              </Text>
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.topicCard}>
              <Text style={[styles.topicTitle, { color: theme.text }]}>Fall Armyworm (Spodoptera frugiperda)</Text>
              <Text style={[styles.topicBody, { color: theme.textSecondary }]}>
                Symptom: Ragged whorl leaf damage and sawdust-like frass on young maize crops.
              </Text>
              <Text style={[styles.remedyText, { color: theme.primary }]}>
                Recommended Action: Handpicking in early stages, neem oil extracts, or pyrethroid spray at dusk.
              </Text>
            </ThemedView>
          </Collapsible>

          <Collapsible title="📍 Adama Woreda Extension Offices">
            <ThemedView type="backgroundElement" style={styles.topicCard}>
              <Text style={[styles.topicTitle, { color: theme.text }]}>Adama Central Agriculture Office</Text>
              <Text style={[styles.topicBody, { color: theme.textSecondary }]}>
                Location: Kebele 04, Adama Main Boulevard{'\n'}
                Contact: +251 22 111 2345 • Extension Desk: Ext 104
              </Text>
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.topicCard}>
              <Text style={[styles.topicTitle, { color: theme.text }]}>Wonji Kuriftu Agronomy Center</Text>
              <Text style={[styles.topicBody, { color: theme.textSecondary }]}>
                Irrigation and soil testing laboratory for sugar cane, maize, and vegetable cooperatives.
              </Text>
            </ThemedView>
          </Collapsible>

          <Collapsible title="🔒 Security & Better Auth Protocol">
            <ThemedText type="small">
              Authentication in this app uses <ThemedText type="code">better-auth</ThemedText> backed by
              PostgreSQL and SMS OTP dispatch via Africa's Talking.
            </ThemedText>
            <ThemedText type="small">
              Session tokens are securely persisted on your device and transmitted via{' '}
              <ThemedText type="code">Authorization: Bearer &lt;token&gt;</ThemedText> headers.
            </ThemedText>
          </Collapsible>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  titleContainer: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  cardHeaderIcon: {
    fontSize: 24,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardHeaderSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  testButton: {
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 4,
  },
  resultText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultTimestamp: {
    fontSize: 11,
  },
  sectionsWrapper: {
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  topicCard: {
    padding: Spacing.three,
    borderRadius: 12,
    gap: 6,
    marginVertical: 4,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  topicBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  remedyText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
