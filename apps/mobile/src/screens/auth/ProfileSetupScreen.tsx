import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';

export interface ProfileSetupScreenProps {
  onComplete?: () => void;
}

export function ProfileSetupScreen({ onComplete }: ProfileSetupScreenProps) {
  const [localId, setLocalId] = useState('');
  const [city, setCity] = useState('Adama');
  const [kebele, setKebele] = useState('Kebele 01');
  const [consentAgreed, setConsentAgreed] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Farmer Profile Setup</Text>
          <Text style={styles.subtitle}>
            Enter your local kebele registration details to link extension advisories.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Local Farmer ID / የመታወቂያ ቁጥር</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ADM-KEB01-1042"
              value={localId}
              onChangeText={setLocalId}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City Jurisdiction / ከተማ መስተዳድር</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={city}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kebele / ቀበሌ</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kebele 01"
              value={kebele}
              onChangeText={setKebele}
            />
          </View>

          {/* Single Consent Flag (DIAG-12, AGENT-5, COMM-9) */}
          <View style={styles.consentRow}>
            <Switch
              value={consentAgreed}
              onValueChange={setConsentAgreed}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
            />
            <Text style={styles.consentText}>
              I consent to agronomic data processing, outbreak cluster alerts, and SMS advisories.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
            ]}
            onPress={onComplete}>
            <Text style={styles.submitButtonText}>Save Profile & Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: Spacing.four,
  },
  header: {
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.one,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.four,
    ...Shadows.card,
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.one,
  },
  input: {
    height: TouchTargets.minimum,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  readOnlyInput: {
    backgroundColor: Colors.light.backgroundElement,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.three,
    gap: Spacing.two,
  },
  consentText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    height: TouchTargets.primaryButton,
    borderRadius: Radii.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  submitButtonPressed: {
    backgroundColor: Colors.light.primaryHover,
  },
  submitButtonText: {
    color: Colors.light.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
});
