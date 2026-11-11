import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useTranslation, LanguageCode } from '@/i18n';

interface VisualCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  spokenText?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  selected?: boolean;
}

const langToSpeechLocale: Record<LanguageCode, string> = {
  en: 'en-US',
  am: 'am-ET',
  om: 'om-ET',
  ti: 'ti-ET',
};

export function VisualCard({
  title,
  subtitle,
  badge,
  badgeColor = '#16A34A',
  icon,
  spokenText,
  onPress,
  children,
  selected = false,
}: VisualCardProps) {
  const { language } = useTranslation();

  const handleSpeak = (e: any) => {
    e.stopPropagation();
    const textToRead = spokenText || `${title}. ${subtitle || ''}`;
    try {
      Speech.speak(textToRead, {
        language: langToSpeechLocale[language] || 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch {
      // Audio fallback
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.selectedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {icon}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          {badge && (
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.speakerButton}
            onPress={handleSpeak}
            accessibilityLabel="Listen"
          >
            <Volume2 size={18} color="#566153" />
          </TouchableOpacity>
        </View>
      </View>

      {children && <View style={styles.body}>{children}</View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 2,
    borderColor: '#E2DBD0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectedCard: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#151A14',
  },
  subtitle: {
    fontSize: 13,
    color: '#566153',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  speakerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0ECE1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE1',
    paddingTop: 10,
  },
});

