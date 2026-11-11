import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, PhoneCall, RefreshCw } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { useAuth } from '@/providers/auth-provider';

export default function RegistrationPendingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { refreshSession, user } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheckAgain = async () => {
    setChecking(true);
    try {
      await refreshSession();
      if (user?.status === 'APPROVED') {
        if (user?.role === 'DA' || user?.role === 'da') {
          router.replace('/(da)/farmers' as any);
        } else {
          router.replace('/(farmer)' as any);
        }
      }
    } catch {
      // Keep in pending
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Clock size={40} color="#C78326" />
          </View>

          <Text style={styles.title}>{t('auth.pendingTitle')}</Text>
          <Text style={styles.message}>{t('auth.pendingMessage')}</Text>

          <View style={styles.contactBox}>
            <Text style={styles.contactLabel}>Adama Agricultural Extension Desk</Text>
            <TouchableOpacity style={styles.phoneButton}>
              <PhoneCall size={18} color="#16A34A" />
              <Text style={styles.phoneNumber}>+251 22 111 2345</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.checkButton}
            onPress={handleCheckAgain}
            disabled={checking}
            activeOpacity={0.8}
          >
            {checking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonInner}>
                <RefreshCw size={20} color="#FFFFFF" />
                <Text style={styles.checkText}>{t('auth.checkAgain')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <VoiceBar
        title={t('auth.pendingTitle')}
        readAloudText={`${t('auth.pendingTitle')}. ${t('auth.pendingMessage')}`}
      />
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
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2DBD0',
    elevation: 4,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#151A14',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#566153',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  contactBox: {
    width: '100%',
    backgroundColor: '#FAF8F4',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 8,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  phoneNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803D',
  },
  checkButton: {
    width: '100%',
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
