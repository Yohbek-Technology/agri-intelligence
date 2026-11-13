import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { VoiceTextInput } from '@/components/VoiceTextInput';
import { api } from '@/services/api';

export default function FarmerRegistrationScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [localIdNumber, setLocalIdNumber] = useState('');
  const [kebele, setKebele] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [literacyLevel, setLiteracyLevel] = useState<'NONE' | 'BASIC' | 'FULL'>('BASIC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName || !phoneNumber || !localIdNumber) {
      setError('Please fill in your name, phone number, and local ID');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.post('/api/v1/farmers', {
        full_name: fullName,
        phone_number: phoneNumber,
        local_id_number: localIdNumber,
        kebele_id: kebele || undefined,
        gender,
        literacy_level: literacyLevel,
        status: 'APPROVED',
      });
      router.replace('/(farmer)');
    } catch (err: any) {
      // In offline mode, queued in sync_queue and active locally
      router.replace('/(farmer)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('auth.registerTitle')}</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <VoiceTextInput
          label={t('auth.fullName')}
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Abebe Bikila"
        />

        <VoiceTextInput
          label={t('auth.phoneLabel')}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+251911234567"
          keyboardType="phone-pad"
        />

        <VoiceTextInput
          label={t('auth.localId')}
          value={localIdNumber}
          onChangeText={setLocalIdNumber}
          placeholder="e.g. KB-2024-001"
        />

        <VoiceTextInput
          label={t('auth.kebele')}
          value={kebele}
          onChangeText={setKebele}
          placeholder="e.g. Boku Shenen"
        />

        {/* Gender Selector */}
        <Text style={styles.fieldLabel}>{t('auth.gender')}</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, gender === 'M' && styles.activeToggle]}
            onPress={() => setGender('M')}
          >
            <Text style={[styles.toggleText, gender === 'M' && styles.activeToggleText]}>
              {t('auth.male')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, gender === 'F' && styles.activeToggle]}
            onPress={() => setGender('F')}
          >
            <Text style={[styles.toggleText, gender === 'F' && styles.activeToggleText]}>
              {t('auth.female')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Literacy Selector */}
        <Text style={styles.fieldLabel}>{t('auth.literacyLevel')}</Text>
        <View style={styles.literacyGrid}>
          {(['NONE', 'BASIC', 'FULL'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.literacyOption, literacyLevel === level && styles.activeToggle]}
              onPress={() => setLiteracyLevel(level)}
            >
              <Text style={[styles.toggleText, literacyLevel === level && styles.activeToggleText]}>
                {level === 'NONE'
                  ? t('auth.literacyNone')
                  : level === 'BASIC'
                  ? t('auth.literacyBasic')
                  : t('auth.literacyFull')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>{t('common.submit')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <VoiceBar title={t('auth.registerTitle')} readAloudText={t('auth.registerTitle')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#151A14',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
    marginTop: 12,
    marginBottom: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFD9CB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeToggle: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#566153',
  },
  activeToggleText: {
    color: '#15803D',
  },
  literacyGrid: {
    gap: 8,
  },
  literacyOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFD9CB',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    elevation: 3,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

