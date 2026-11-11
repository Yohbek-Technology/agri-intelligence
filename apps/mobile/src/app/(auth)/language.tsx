import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Volume2, Check } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useTranslation, LanguageCode } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';

const languages: { code: LanguageCode; nativeName: string; englishName: string; speechLocale: string }[] = [
  { code: 'am', nativeName: 'አማርኛ', englishName: 'Amharic', speechLocale: 'am-ET' },
  { code: 'om', nativeName: 'Afaan Oromoo', englishName: 'Oromo', speechLocale: 'om-ET' },
  { code: 'ti', nativeName: 'ትግርኛ', englishName: 'Tigrinya', speechLocale: 'ti-ET' },
  { code: 'en', nativeName: 'English', englishName: 'English', speechLocale: 'en-US' },
];

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();

  const handleSelect = (code: LanguageCode, nativeName: string, speechLocale: string) => {
    setLanguage(code);
    try {
      Speech.speak(nativeName, { language: speechLocale, pitch: 1.0, rate: 0.9 });
    } catch {
      // Fallback
    }
  };

  const handleContinue = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>AgrIntel</Text>
          <Text style={styles.subtitle}>{t('auth.selectLanguage')}</Text>
        </View>

        <View style={styles.list}>
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langCard, isSelected && styles.selectedCard]}
                onPress={() => handleSelect(lang.code, lang.nativeName, lang.speechLocale)}
                activeOpacity={0.8}
              >
                <View style={styles.cardContent}>
                  <Text style={[styles.nativeText, isSelected && styles.selectedText]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={styles.englishText}>{lang.englishName}</Text>
                </View>
                {isSelected ? (
                  <View style={styles.checkCircle}>
                    <Check size={20} color="#FFFFFF" />
                  </View>
                ) : (
                  <Volume2 size={24} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>{t('common.continue')}</Text>
        </TouchableOpacity>
      </View>
      <VoiceBar title={t('auth.selectLanguage')} readAloudText={t('auth.selectLanguage')} />
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
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#16A34A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#151A14',
    marginTop: 8,
  },
  list: {
    gap: 12,
    marginBottom: 32,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2DBD0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 72,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  cardContent: {
    flex: 1,
  },
  nativeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#151A14',
  },
  selectedText: {
    color: '#15803D',
  },
  englishText: {
    fontSize: 14,
    color: '#566153',
    marginTop: 2,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

