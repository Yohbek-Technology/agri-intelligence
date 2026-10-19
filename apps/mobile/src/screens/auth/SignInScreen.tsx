import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';
import { useAuth } from '@/context/AuthContext';

export interface SignInScreenProps {
  onSuccess?: () => void;
}

export function SignInScreen({ onSuccess }: SignInScreenProps) {
  const { signInWithPhone, requestOtp, verifyOtpAndSignUp, error, clearError } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    clearError();
    setLocalError(null);
    setSubmitting(true);

    try {
      if (!isSignUp) {
        // Sign In Flow (Phone + Password only)
        const res = await signInWithPhone({
          phoneNumber: phoneNumber.trim(),
          password,
        });
        if (res.success) {
          onSuccess?.();
        } else {
          setLocalError(res.error || 'Sign in failed');
        }
      } else {
        // Sign Up Flow
        if (!otpSent) {
          const res = await requestOtp({ phoneNumber: phoneNumber.trim() });
          if (res.success) {
            setOtpSent(true);
          } else {
            setLocalError(res.error || 'Failed to send verification SMS');
          }
        } else {
          const res = await verifyOtpAndSignUp({
            phoneNumber: phoneNumber.trim(),
            code: otpCode.trim(),
            password,
            name: name.trim(),
          });
          if (res.success) {
            onSuccess?.();
          } else {
            setLocalError(res.error || 'Verification failed');
          }
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>🌾</Text>
            <Text style={styles.title}>{isSignUp ? 'Farmer Registration' : 'Farmer & DA Sign In'}</Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Register with your mobile phone number'
                : 'Sign in with your phone number and password'}
            </Text>
          </View>

          {displayError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            {isSignUp ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name / ሙሉ ስም</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Abebe Balcha"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number / ስልክ ቁጥር</Text>
              <TextInput
                style={styles.input}
                placeholder="+251 91 123 4567"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            {(!isSignUp || otpSent) ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password / የይለፍ ቃል</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Min 10 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            ) : null}

            {isSignUp && otpSent ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>6-Digit SMS Verification Code</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="123456"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={Colors.light.primaryText} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isSignUp
                    ? otpSent
                      ? 'Verify & Complete Registration'
                      : 'Send Verification SMS'
                    : 'Sign In'}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.switchModeButton}
              onPress={() => {
                clearError();
                setLocalError(null);
                setOtpSent(false);
                setIsSignUp(!isSignUp);
              }}>
              <Text style={styles.switchModeText}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : 'New farmer? Create an Account'}
              </Text>
            </Pressable>
          </View>

          {/* Officer/Admin Notice */}
          <View style={styles.officerNotice}>
            <Text style={styles.officerNoticeText}>
              🏛️ Agricultural Officers & System Admins: Please access the City Web Portal on your computer.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  logo: {
    fontSize: 44,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  errorBox: {
    backgroundColor: Colors.light.dangerLight,
    padding: Spacing.three,
    borderRadius: Radii.medium,
    marginBottom: Spacing.three,
  },
  errorText: {
    color: Colors.light.danger,
    fontSize: 14,
    fontWeight: '600',
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
  otpInput: {
    letterSpacing: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    height: TouchTargets.primaryButton,
    borderRadius: Radii.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  submitButtonPressed: {
    backgroundColor: Colors.light.primaryHover,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.light.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
  switchModeButton: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  switchModeText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  officerNotice: {
    marginTop: Spacing.five,
    padding: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radii.medium,
  },
  officerNoticeText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
