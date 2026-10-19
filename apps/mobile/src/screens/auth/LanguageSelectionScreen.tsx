import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';
import type { SupportedLanguage } from '@/config/constants';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  native: string;
  welcomeVoice: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'am', name: 'Amharic', native: 'አማርኛ', welcomeVoice: 'እንኳን ወደ ግብርና ኢንተለጀንስ በደህና መጡ' },
  { code: 'om', name: 'Afaan Oromoo', native: 'Afaan Oromoo', welcomeVoice: 'Baga nagaan dhuftan' },
  { code: 'ti', name: 'Tigrinya', native: 'ትግርኛ', welcomeVoice: 'እንቋዕ ብደሓን መጻእኹም' },
  { code: 'en', name: 'English', native: 'English', welcomeVoice: 'Welcome to Agri Intelligence' },
];

export interface LanguageSelectionScreenProps {
  onSelectLanguage?: (lang: SupportedLanguage) => void;
}

export function LanguageSelectionScreen({ onSelectLanguage }: LanguageSelectionScreenProps) {
  const handleSelect = (lang: SupportedLanguage) => {
    onSelectLanguage?.(lang);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.title}>Agri Intelligence</Text>
          <Text style={styles.subtitle}>
            Select your language / ቋንቋዎን ይምረጡ / Afaan keessan filadhaa / ቋንቋኹም ምረጹ
          </Text>
        </View>

        <View style={styles.languageList}>
          {LANGUAGES.map((item) => (
            <Pressable
              key={item.code}
              onPress={() => handleSelect(item.code)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.name}`}
              style={({ pressed }) => [
                styles.langCard,
                Shadows.card,
                pressed && styles.langCardPressed,
              ]}>
              <View>
                <Text style={styles.langNative}>{item.native}</Text>
                <Text style={styles.langEnglish}>{item.name}</Text>
              </View>
              <Text style={styles.speakerIcon}>🔊</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  logo: {
    fontSize: 48,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.two,
    lineHeight: 20,
  },
  languageList: {
    gap: Spacing.three,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    minHeight: TouchTargets.primaryButton,
  },
  langCardPressed: {
    backgroundColor: Colors.light.primarySubtle,
    borderColor: Colors.light.primary,
  },
  langNative: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  langEnglish: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  speakerIcon: {
    fontSize: 22,
  },
});
