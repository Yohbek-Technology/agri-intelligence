import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle2, AlertTriangle, Volume2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useTranslation, LanguageCode } from '@/i18n';
import { tokens } from '@/theme/tokens';

interface FarmOrNotCardProps {
  activity: 'plowing' | 'spraying' | 'harvesting';
  status: 'GO' | 'WAIT';
  title: string;
  reason: string;
  detail?: string;
}

const langToSpeechLocale: Record<LanguageCode, string> = {
  en: 'en-US',
  am: 'am-ET',
  om: 'om-ET',
  ti: 'ti-ET',
};

export function FarmOrNotCard({
  activity,
  status,
  title,
  reason,
  detail,
}: FarmOrNotCardProps) {
  const { language, t } = useTranslation();
  const isGo = status === 'GO';

  const handleSpeak = () => {
    const text = `${title}. ${isGo ? t('weather.go') : t('weather.wait')}. ${reason}`;
    try {
      Speech.speak(text, {
        language: langToSpeechLocale[language] || 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch {
      // Audio fallback
    }
  };

  return (
    <View style={[styles.card, isGo ? styles.goCard : styles.waitCard]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {isGo ? (
            <CheckCircle2 size={24} color="#16A34A" />
          ) : (
            <AlertTriangle size={24} color="#DC2626" />
          )}
          <Text style={styles.activityTitle}>{title}</Text>
        </View>

        <TouchableOpacity
          style={styles.speakerButton}
          onPress={handleSpeak}
          accessibilityLabel="Read decision aloud"
        >
          <Volume2 size={18} color="#151A14" />
        </TouchableOpacity>
      </View>

      <View style={styles.badgeRow}>
        <View style={[styles.statusBadge, isGo ? styles.goBadge : styles.waitBadge]}>
          <Text style={[styles.statusText, isGo ? styles.goText : styles.waitText]}>
            {isGo ? t('weather.go') : t('weather.wait')}
          </Text>
        </View>
        {detail && <Text style={styles.detailText}>{detail}</Text>}
      </View>

      <Text style={styles.reasonText}>{reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 2,
    elevation: 3,
  },
  goCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  waitCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#151A14',
  },
  speakerButton: {
    width: tokens.touchTarget.min,
    height: tokens.touchTarget.min,
    borderRadius: tokens.touchTarget.min / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goBadge: {
    backgroundColor: '#16A34A',
  },
  waitBadge: {
    backgroundColor: '#DC2626',
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  goText: {
    color: '#FFFFFF',
  },
  waitText: {
    color: '#FFFFFF',
  },
  detailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#566153',
  },
  reasonText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
});

