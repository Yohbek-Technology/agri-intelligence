import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, KeyRound } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { useAuth } from '@/providers/auth-provider';

export default function PhoneOtpLoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { requestOtp, verifyOtpAndSignUp } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Please enter a valid 9-digit Ethiopian mobile number');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const fullPhone = phoneNumber.startsWith('+251') ? phoneNumber : `+251${phoneNumber.replace(/^0/, '')}`;
      const res = await requestOtp({ phoneNumber: fullPhone });
      if (res.success) {
        setStep('otp');
      } else {
        setError(res.error || 'Failed to send OTP code. Please check your network.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP code. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const fullPhone = phoneNumber.startsWith('+251') ? phoneNumber : `+251${phoneNumber.replace(/^0/, '')}`;
      const res = await verifyOtpAndSignUp({ phoneNumber: fullPhone, code: otpCode });
      if (res.success && res.data) {
        const authData = res.data as { user?: { status?: string; role?: string } };
        if (authData.user?.status === 'SUSPENDED') {
          setError('Your account has been suspended by the agricultural office. Please contact support.');
          return;
        }
        if (authData.user?.role === 'DA' || authData.user?.role === 'da') {
          router.replace('/(da)/farmers' as any);
        } else {
          router.replace('/(farmer)' as any);
        }
      } else {
        setError(res.error || 'Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.loginTitle')}</Text>
          <Text style={styles.subtitle}>
            {step === 'phone' ? t('auth.phoneLabel') : t('auth.otpPrompt')}
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {step === 'phone' ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>+251</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder={t('auth.phonePlaceholder')}
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={(val) => {
                  setPhoneNumber(val);
                  setError(null);
                }}
                maxLength={10}
              />
              <Phone size={20} color="#566153" style={styles.inputIcon} />
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSendOtp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>{t('auth.sendOtp')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.registerLinkText}>New farmer? Register here</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.otpInputContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={otpCode}
                onChangeText={(val) => {
                  setOtpCode(val);
                  setError(null);
                }}
                maxLength={6}
              />
              <KeyRound size={20} color="#566153" style={styles.inputIcon} />
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVerifyOtp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>{t('auth.verify')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => setStep('phone')}
            >
              <Text style={styles.backLinkText}>Change phone number</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <VoiceBar
        title={t('auth.loginTitle')}
        readAloudText={step === 'phone' ? t('auth.phoneLabel') : t('auth.otpPrompt')}
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#151A14',
  },
  subtitle: {
    fontSize: 15,
    color: '#566153',
    marginTop: 6,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFD9CB',
    borderRadius: 14,
    minHeight: 56,
    paddingHorizontal: 12,
  },
  prefixBox: {
    borderRightWidth: 1,
    borderRightColor: '#E2DBD0',
    paddingRight: 12,
    marginRight: 12,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#151A14',
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#151A14',
  },
  otpInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFD9CB',
    borderRadius: 14,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  otpInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 6,
    color: '#151A14',
    textAlign: 'center',
  },
  inputIcon: {
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  registerLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 14,
    color: '#566153',
  },
});
