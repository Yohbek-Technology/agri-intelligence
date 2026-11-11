import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Globe, Volume2, Mic, Calendar, Type, LogOut, RefreshCw } from 'lucide-react-native';
import { useTranslation, LanguageCode } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { useAuth } from '@/providers/auth-provider';

export default function SettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();
  const { signOut, user } = useAuth();

  const [autoTts, setAutoTts] = useState(true);
  const [voiceNav, setVoiceNav] = useState(true);
  const [dateFormat, setDateFormat] = useState<'GREGORIAN' | 'ETHIOPIAN'>('GREGORIAN');
  const [textSize, setTextSize] = useState<'NORMAL' | 'LARGE'>('LARGE');

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('nav.settings')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Identity Banner */}
        <View style={styles.userBanner}>
          <Text style={styles.userName}>{user?.name || 'Abebe Bikila'}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'DA' ? 'Development Agent (DA)' : 'Smallholder Farmer'} • {user?.phoneNumber || '+251 91 123 4567'}
          </Text>
        </View>

        {/* Sync Desk Shortcut */}
        <TouchableOpacity
          style={styles.syncShortcut}
          onPress={() => router.push('/settings/sync')}
        >
          <RefreshCw size={20} color="#16A34A" />
          <View style={styles.syncShortcutText}>
            <Text style={styles.syncShortcutTitle}>Offline Sync & Conflict Desk</Text>
            <Text style={styles.syncShortcutSub}>Check queued changes and sync with server</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Accessibility & Voice</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Volume2 size={20} color="#16A34A" />
            <View>
              <Text style={styles.settingLabel}>Auto Text-To-Speech (Auto-TTS)</Text>
              <Text style={styles.settingSub}>Automatically read screen content aloud on open</Text>
            </View>
          </View>
          <Switch value={autoTts} onValueChange={setAutoTts} trackColor={{ true: '#16A34A' }} />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Mic size={20} color="#16A34A" />
            <View>
              <Text style={styles.settingLabel}>Voice-First Navigation</Text>
              <Text style={styles.settingSub}>Accept spoken voice commands for screen routing</Text>
            </View>
          </View>
          <Switch value={voiceNav} onValueChange={setVoiceNav} trackColor={{ true: '#16A34A' }} />
        </View>

        <Text style={styles.sectionTitle}>Localization & Display</Text>

        <View style={styles.cardBox}>
          <Text style={styles.boxTitle}>Language (ቋንቋ)</Text>
          <View style={styles.langGrid}>
            {(['am', 'om', 'ti', 'en'] as const).map((code) => (
              <TouchableOpacity
                key={code}
                style={[styles.langBtn, language === code && styles.activeLangBtn]}
                onPress={() => setLanguage(code)}
              >
                <Text style={[styles.langBtnText, language === code && styles.activeLangBtnText]}>
                  {code === 'am' ? 'አማርኛ' : code === 'om' ? 'Oromoo' : code === 'ti' ? 'ትግርኛ' : 'English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Sign Out of AgrIntel</Text>
        </TouchableOpacity>
      </ScrollView>
      <VoiceBar title={t('nav.settings')} readAloudText={t('nav.settings')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DFD9CB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A14',
  },
  scroll: {
    padding: 16,
    paddingBottom: 28,
  },
  userBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 16,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A14',
  },
  userRole: {
    fontSize: 12,
    color: '#566153',
    marginTop: 2,
  },
  syncShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  syncShortcutText: {
    flex: 1,
  },
  syncShortcutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  syncShortcutSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#151A14',
    marginVertical: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 14,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
  },
  settingSub: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 2,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 14,
    marginBottom: 16,
  },
  boxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#151A14',
    marginBottom: 10,
  },
  langGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    flex: 1,
    backgroundColor: '#FAF8F4',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeLangBtn: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#566153',
  },
  activeLangBtnText: {
    color: '#15803D',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 20,
    paddingVertical: 14,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
});

