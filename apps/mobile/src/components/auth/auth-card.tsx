import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  PhoneSignInSchema,
  UsernameSignInSchema,
  PhoneSignUpSchema,
  PhoneOtpVerifySchema,
  type AppLanguage,
} from '@repo/shared';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { authService } from '@/services/auth';

type AuthMode = 'sign-in' | 'sign-up';
type SignInMethod = 'phone' | 'username';

const LANGUAGES: { code: AppLanguage; label: string; native: string }[] = [
  { code: 'am', label: 'Amharic', native: 'አማርኛ' },
  { code: 'om', label: 'Oromo', native: 'Afaan Oromoo' },
  { code: 'ti', label: 'Tigrinya', native: 'ትግርኛ' },
  { code: 'en', label: 'English', native: 'English' },
];

export function AuthCard({ onSuccess }: { onSuccess?: () => void }) {
  const theme = useTheme();
  const { signInWithPhone, signInWithUsername, requestOtp, verifyOtpAndSignUp, error, clearError } =
    useAuth();

  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [signInMethod, setSignInMethod] = useState<SignInMethod>('phone');
  const [loading, setLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Sign In state
  const [signInIdentifier, setSignInIdentifier] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Sign Up state
  const [signUpStep, setSignUpStep] = useState<'form' | 'otp'>('form');
  const [fullName, setFullName] = useState<string>('');
  const [signUpPhone, setSignUpPhone] = useState<string>('');
  const [signUpUsername, setSignUpUsername] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [preferredLang, setPreferredLang] = useState<AppLanguage>('am');

  // OTP state
  const [otpCode, setOtpCode] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Reset errors on mode change
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [mode, signInMethod, clearError]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (signUpStep === 'otp' && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [signUpStep, resendCountdown]);

  // Handle Sign In Submit
  const handleSignIn = async () => {
    setLocalError(null);
    setLoading(true);

    try {
      if (signInMethod === 'phone') {
        const val = PhoneSignInSchema.safeParse({
          phoneNumber: signInIdentifier.trim(),
          password: signInPassword,
        });
        if (!val.success) {
          setLocalError(val.error.issues[0]?.message ?? 'Invalid input');
          setLoading(false);
          return;
        }
        const res = await signInWithPhone({
          phoneNumber: signInIdentifier.trim(),
          password: signInPassword,
        });
        if (res.success) {
          onSuccess?.();
        } else {
          setLocalError(res.error ?? 'Sign in failed');
        }
      } else {
        const val = UsernameSignInSchema.safeParse({
          username: signInIdentifier.trim().toLowerCase(),
          password: signInPassword,
        });
        if (!val.success) {
          setLocalError(val.error.issues[0]?.message ?? 'Invalid input');
          setLoading(false);
          return;
        }
        const res = await signInWithUsername({
          username: signInIdentifier.trim().toLowerCase(),
          password: signInPassword,
        });
        if (res.success) {
          onSuccess?.();
        } else {
          setLocalError(res.error ?? 'Sign in failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Request OTP for Sign Up
  const handleRequestSignUpOtp = async () => {
    setLocalError(null);
    setLoading(true);

    try {
      const val = PhoneSignUpSchema.safeParse({
        name: fullName.trim(),
        phoneNumber: signUpPhone.trim(),
        username: signUpUsername.trim().toLowerCase(),
        password: signUpPassword,
        preferredLanguage: preferredLang,
      });

      if (!val.success) {
        setLocalError(val.error.issues[0]?.message ?? 'Please review your input');
        return;
      }

      // Check if phone already registered before sending OTP
      const exists = await authService.checkPhoneExists(signUpPhone.trim());
      if (exists) {
        setLocalError('This phone number is already registered. Please sign in instead.');
        return;
      }

      const res = await requestOtp({ phoneNumber: signUpPhone.trim() });
      if (res.success) {
        setSignUpStep('otp');
        setResendCountdown(60);
        setCanResend(false);
      } else {
        setLocalError(res.error ?? 'Failed to send verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP and Complete Registration
  const handleVerifyOtp = async () => {
    setLocalError(null);
    setLoading(true);

    try {
      const val = PhoneOtpVerifySchema.safeParse({
        phoneNumber: signUpPhone.trim(),
        code: otpCode.trim(),
        name: fullName.trim(),
        password: signUpPassword,
        preferredLanguage: preferredLang,
        username: signUpUsername.trim().toLowerCase(),
      });

      if (!val.success) {
        setLocalError(val.error.issues[0]?.message ?? 'Enter a valid 6-digit code');
        return;
      }

      const res = await verifyOtpAndSignUp({
        phoneNumber: signUpPhone.trim(),
        code: otpCode.trim(),
        name: fullName.trim(),
        password: signUpPassword,
        preferredLanguage: preferredLang,
        username: signUpUsername.trim().toLowerCase(),
      });

      if (res.success) {
        onSuccess?.();
      } else {
        setLocalError(res.error ?? 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const activeError = localError || error;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}>
      {/* Top Mode Segment (Sign In | Create Account) */}
      <View style={[styles.modeTabs, { backgroundColor: theme.backgroundElement }]}>
        <Pressable
          style={[
            styles.modeTab,
            mode === 'sign-in' && [styles.modeTabActive, { backgroundColor: theme.card }],
          ]}
          onPress={() => {
            setMode('sign-in');
            setSignUpStep('form');
          }}>
          <Text
            style={[
              styles.modeTabText,
              { color: mode === 'sign-in' ? theme.text : theme.textSecondary },
              mode === 'sign-in' && styles.modeTabTextBold,
            ]}>
            Sign In
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.modeTab,
            mode === 'sign-up' && [styles.modeTabActive, { backgroundColor: theme.card }],
          ]}
          onPress={() => setMode('sign-up')}>
          <Text
            style={[
              styles.modeTabText,
              { color: mode === 'sign-up' ? theme.text : theme.textSecondary },
              mode === 'sign-up' && styles.modeTabTextBold,
            ]}>
            Create Account
          </Text>
        </Pressable>
      </View>

      {/* Error Alert Banner */}
      {activeError && (
        <View style={[styles.errorBox, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}>
          <Text style={[styles.errorText, { color: theme.danger }]}>⚠️ {activeError}</Text>
        </View>
      )}

      {/* SIGN IN FORM */}
      {mode === 'sign-in' && (
        <View style={styles.formContainer}>
          {/* Method Selector: Phone Number vs Username */}
          <View style={styles.methodSelector}>
            <Pressable
              style={[
                styles.methodChip,
                signInMethod === 'phone'
                  ? [styles.methodChipActive, { borderColor: theme.primary, backgroundColor: theme.primarySubtle }]
                  : { borderColor: theme.border, backgroundColor: theme.backgroundElement },
              ]}
              onPress={() => setSignInMethod('phone')}>
              <Text
                style={[
                  styles.methodChipText,
                  { color: signInMethod === 'phone' ? theme.primary : theme.textSecondary },
                ]}>
                📱 Phone Number
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.methodChip,
                signInMethod === 'username'
                  ? [styles.methodChipActive, { borderColor: theme.primary, backgroundColor: theme.primarySubtle }]
                  : { borderColor: theme.border, backgroundColor: theme.backgroundElement },
              ]}
              onPress={() => setSignInMethod('username')}>
              <Text
                style={[
                  styles.methodChipText,
                  { color: signInMethod === 'username' ? theme.primary : theme.textSecondary },
                ]}>
                👤 Username
              </Text>
            </Pressable>
          </View>

          {/* Identifier Input */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {signInMethod === 'phone' ? 'Ethiopian Phone Number' : 'Username'}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder={signInMethod === 'phone' ? '+251 9XX XXX XXX or 09XXXXXXXX' : 'e.g. adama_farmer'}
              placeholderTextColor={theme.textSecondary}
              value={signInIdentifier}
              onChangeText={setSignInIdentifier}
              autoCapitalize="none"
              keyboardType={signInMethod === 'phone' ? 'phone-pad' : 'default'}
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Text style={[styles.showHideText, { color: theme.primary }]}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Enter your account password"
              placeholderTextColor={theme.textSecondary}
              value={signInPassword}
              onChangeText={setSignInPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
          </View>

          {/* Submit Button */}
          <Pressable
            style={[
              styles.submitButton,
              { backgroundColor: theme.primary },
              (!signInIdentifier || !signInPassword || loading) && styles.submitButtonDisabled,
            ]}
            disabled={!signInIdentifier || !signInPassword || loading}
            onPress={handleSignIn}>
            {loading ? (
              <ActivityIndicator color={theme.primaryText} size="small" />
            ) : (
              <Text style={[styles.submitButtonText, { color: theme.primaryText }]}>Sign In to Mobile</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* SIGN UP FORM */}
      {mode === 'sign-up' && signUpStep === 'form' && (
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="e.g. Chala Tolossa"
              placeholderTextColor={theme.textSecondary}
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number (SMS OTP)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="+2519... or 09..."
              placeholderTextColor={theme.textSecondary}
              value={signUpPhone}
              onChangeText={setSignUpPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Username (letters, numbers, _)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="e.g. chala_farm"
              placeholderTextColor={theme.textSecondary}
              value={signUpUsername}
              onChangeText={(t) => setSignUpUsername(t.toLowerCase())}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Password (10+ characters, Aa + 0-9)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Min 10 characters with upper, lower, number"
              placeholderTextColor={theme.textSecondary}
              value={signUpPassword}
              onChangeText={setSignUpPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
          </View>

          {/* Preferred Language */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Preferred Language</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  style={[
                    styles.langChip,
                    preferredLang === lang.code
                      ? [styles.langChipActive, { backgroundColor: theme.primarySubtle, borderColor: theme.primary }]
                      : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}
                  onPress={() => setPreferredLang(lang.code)}>
                  <Text
                    style={[
                      styles.langChipText,
                      { color: preferredLang === lang.code ? theme.primary : theme.text },
                    ]}>
                    {lang.native}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Continue Button */}
          <Pressable
            style={[
              styles.submitButton,
              { backgroundColor: theme.primary },
              (!fullName || !signUpPhone || !signUpUsername || !signUpPassword || loading) &&
                styles.submitButtonDisabled,
            ]}
            disabled={!fullName || !signUpPhone || !signUpUsername || !signUpPassword || loading}
            onPress={handleRequestSignUpOtp}>
            {loading ? (
              <ActivityIndicator color={theme.primaryText} size="small" />
            ) : (
              <Text style={[styles.submitButtonText, { color: theme.primaryText }]}>Send 6-Digit Verification Code</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* OTP VERIFY STEP */}
      {mode === 'sign-up' && signUpStep === 'otp' && (
        <View style={styles.formContainer}>
          <View style={styles.otpHeader}>
            <Text style={[styles.otpTitle, { color: theme.text }]}>Enter Verification Code</Text>
            <Text style={[styles.otpSubtitle, { color: theme.textSecondary }]}>
              We sent a 6-digit code via SMS to{' '}
              <Text style={{ fontWeight: '700', color: theme.text }}>{signUpPhone}</Text>
            </Text>
          </View>

          <TextInput
            style={[
              styles.otpInput,
              {
                backgroundColor: theme.backgroundElement,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="• • • • • •"
            placeholderTextColor={theme.textSecondary}
            value={otpCode}
            onChangeText={(t) => setOtpCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />

          <Pressable
            style={[
              styles.submitButton,
              { backgroundColor: theme.primary },
              (otpCode.length !== 6 || loading) && styles.submitButtonDisabled,
            ]}
            disabled={otpCode.length !== 6 || loading}
            onPress={handleVerifyOtp}>
            {loading ? (
              <ActivityIndicator color={theme.primaryText} size="small" />
            ) : (
              <Text style={[styles.submitButtonText, { color: theme.primaryText }]}>Verify & Sign In</Text>
            )}
          </Pressable>

          <View style={styles.otpActions}>
            <Pressable
              disabled={!canResend || loading}
              onPress={async () => {
                if (!canResend) return;
                setResendCountdown(60);
                setCanResend(false);
                await requestOtp({ phoneNumber: signUpPhone });
              }}>
              <Text
                style={[
                  styles.resendText,
                  { color: canResend ? theme.primary : theme.textSecondary },
                ]}>
                {canResend ? 'Resend SMS Code' : `Resend code in ${resendCountdown}s`}
              </Text>
            </Pressable>

            <Pressable onPress={() => setSignUpStep('form')}>
              <Text style={[styles.backLinkText, { color: theme.textSecondary }]}>← Edit phone number</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    width: '100%',
    maxWidth: 480,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.four,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modeTabTextBold: {
    fontWeight: '700',
  },
  formContainer: {
    gap: Spacing.three,
  },
  methodSelector: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  methodChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  methodChipActive: {
    borderWidth: 1.5,
  },
  methodChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  showHideText: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  langChipActive: {
    borderWidth: 1.5,
  },
  langChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  otpHeader: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  otpSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  otpInput: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 10,
    marginVertical: Spacing.two,
  },
  otpActions: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  backLinkText: {
    fontSize: 13,
  },
});
