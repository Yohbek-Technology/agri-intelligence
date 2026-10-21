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
import { useVoice } from '@/context/VoiceContext';
import { authService } from '@/services/api/auth-service';

export interface SignInScreenProps {
  onSuccess?: () => void;
  onNavigateToOtp?: (params: {
    phoneNumber: string;
    name?: string;
    password?: string;
    isPasswordReset?: boolean;
  }) => void;
  onBackToLanguage?: () => void;
  onRequestHelp?: () => void;
}

export function SignInScreen({
  onSuccess,
  onNavigateToOtp,
  onBackToLanguage,
  onRequestHelp,
}: SignInScreenProps) {
  const { signInWithPhone, requestOtp, requestPasswordReset, error, clearError } = useAuth();
  const { language, speakText, stopSpeaking, isSpeaking } = useVoice();

  // Mode: 'signin' | 'signup' | 'forgot' | 'da_invite'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot' | 'da_invite'>('signin');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [officerWarning, setOfficerWarning] = useState(false);

  const handleAudioGuide = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const guide =
      authMode === 'signin'
        ? language === 'om'
          ? 'Lakkoofsa bilbilaa fi jecha icciitii keessan galchuun seenaa.'
          : 'ስልክ ቁጥርዎን እና የይለፍ ቃልዎን በማስገባት ይግቡ።'
        : language === 'om'
        ? 'Galmee haaraa uumuuf maqaa fi lakkoofsa bilbilaa galchaa.'
        : 'አዲስ መለያ ለመክፈት ሙሉ ስም እና ስልክ ቁጥርዎን ያስገቡ።';
    void speakText(guide, language);
  };

  const handleSubmit = async () => {
    clearError();
    setLocalError(null);
    setOfficerWarning(false);

    const cleanPhone = phoneNumber.trim();

    if (authMode !== 'da_invite' && !cleanPhone) {
      setLocalError('Please enter a valid Ethiopian phone number (+251...).');
      return;
    }

    setSubmitting(true);

    try {
      if (authMode === 'signin') {
        if (!password) {
          setLocalError('Password is required.');
          return;
        }

        const res = await signInWithPhone({
          phoneNumber: cleanPhone,
          password,
        });

        if (res.success) {
          onSuccess?.();
        } else {
          if (res.statusCode === 403 || res.errorCode === 'client_not_permitted') {
            setOfficerWarning(true);
          } else {
            setLocalError(res.error || 'Sign in failed. Check your phone number and password.');
          }
        }
      } else if (authMode === 'signup') {
        if (!fullName.trim()) {
          setLocalError('Please enter your full name.');
          return;
        }
        if (!password || password.length < 10) {
          setLocalError('Password must be at least 10 characters with uppercase, lowercase & a number.');
          return;
        }

        const res = await requestOtp({ phoneNumber: cleanPhone });
        if (res.success) {
          onNavigateToOtp?.({
            phoneNumber: cleanPhone,
            name: fullName.trim(),
            password,
            isPasswordReset: false,
          });
        } else {
          setLocalError(res.error || 'Failed to send SMS verification code.');
        }
      } else if (authMode === 'forgot') {
        const res = await requestPasswordReset({ phoneNumber: cleanPhone });
        if (res.success) {
          onNavigateToOtp?.({
            phoneNumber: cleanPhone,
            password,
            isPasswordReset: true,
          });
        } else {
          setLocalError(res.error || 'Failed to request password reset code.');
        }
      } else if (authMode === 'da_invite') {
        if (!inviteToken.trim()) {
          setLocalError('Please enter your DA invitation token.');
          return;
        }
        const res = await authService.acceptInvitation(inviteToken.trim());
        if (res.success) {
          setAuthMode('signin');
          setLocalError('Invitation verified! Please sign in with your phone credentials.');
        } else {
          setLocalError(res.error || 'Invalid or expired invitation token.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Top Status Header */}
          <View style={styles.topHeader}>
            <Pressable
              onPress={onBackToLanguage}
              accessibilityRole="button"
              accessibilityLabel="Change language"
              style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}>
              <Text style={styles.headerIconText}>←</Text>
            </Pressable>

            <View style={styles.offlinePill}>
              <View style={styles.greenDot} />
              <Text style={styles.offlineText}>Offline Ready</Text>
            </View>

            <Pressable
              onPress={onRequestHelp}
              accessibilityRole="button"
              accessibilityLabel="Help"
              style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}>
              <Text style={styles.headerIconText}>❓</Text>
            </Pressable>
          </View>

          {/* Offline SMS Direct Gateway Banner */}
          <View style={styles.gatewayBanner}>
            <View style={styles.gatewayLeft}>
              <Text style={styles.gatewayIcon}>📶</Text>
              <Text style={styles.gatewayText}>Offline Capable • SMS Direct Gateway</Text>
            </View>
            <View style={styles.simBadge}>
              <Text style={styles.simText}>SIM 1</Text>
            </View>
          </View>

          {/* Language & Audio Guide Row */}
          <View style={styles.langGuideRow}>
            <View style={styles.activeLangPill}>
              <Text style={styles.langIcon}>🌐</Text>
              <Text style={styles.langName}>
                {language === 'om' ? 'Afaan Oromoo' : language === 'ti' ? 'ትግርኛ' : language === 'en' ? 'English' : 'አማርኛ'}
              </Text>
            </View>

            <Pressable
              onPress={handleAudioGuide}
              style={({ pressed }) => [
                styles.audioGuideButton,
                isSpeaking && styles.audioGuideButtonActive,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.audioGuideIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
              <Text style={styles.audioGuideLabel}>
                {language === 'om' ? 'Sagalee Dhaggeeffadhu' : 'የድምፅ መመሪያ'}
              </Text>
            </Pressable>
          </View>

          {/* Title Header Card */}
          <View style={[styles.titleCard, Shadows.card]}>
            <View style={styles.titleRow}>
              <View style={styles.titleBadge}>
                <Text style={styles.titleBadgeIcon}>🌾</Text>
              </View>
              <View style={styles.titleContent}>
                <Text style={styles.mainTitle}>
                  {authMode === 'signup'
                    ? language === 'om'
                      ? 'Galmee Haaraa Uumi'
                      : 'አዲስ መለያ ይፍጠሩ'
                    : authMode === 'forgot'
                    ? language === 'om'
                      ? 'Jecha Icciitii Haaromsi'
                      : 'የይለፍ ቃል መልሶ ማግኛ'
                    : authMode === 'da_invite'
                    ? language === 'om'
                      ? 'Afeerraa DA Fudhadhu'
                      : 'የልማት ጣቢያ ሰራተኛ ግብዣ'
                    : language === 'om'
                    ? 'Seensa Herregaa'
                    : 'ወደ መለያዎ ይግቡ'}
                </Text>
                <Text style={styles.subTitle}>
                  {authMode === 'signup'
                    ? 'Farmer Registration & SMS Verification'
                    : authMode === 'forgot'
                    ? 'Reset password via SMS OTP'
                    : authMode === 'da_invite'
                    ? 'Accept Development Agent credential invitation'
                    : 'Farmer & Extension DA Mobile Portal'}
                </Text>
              </View>
            </View>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <Pressable
              onPress={() => {
                clearError();
                setLocalError(null);
                setOfficerWarning(false);
                setAuthMode('signin');
              }}
              style={[styles.tabButton, authMode === 'signin' && styles.tabButtonActive]}>
              <Text style={[styles.tabText, authMode === 'signin' && styles.tabTextActive]}>
                {language === 'om' ? 'Seensa (Sign In)' : 'ይግቡ (Sign In)'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                clearError();
                setLocalError(null);
                setOfficerWarning(false);
                setAuthMode('signup');
              }}
              style={[styles.tabButton, authMode === 'signup' && styles.tabButtonActive]}>
              <Text style={[styles.tabText, authMode === 'signup' && styles.tabTextActive]}>
                {language === 'om' ? 'Galmee (Sign Up)' : 'ይመዝገቡ (Sign Up)'}
              </Text>
            </Pressable>
          </View>

          {/* Officer/Admin Web Portal Redirection Callout Banner (MOB-3) */}
          {officerWarning && (
            <View style={styles.officerWarningCard}>
              <Text style={styles.officerWarningIcon}>🏛️</Text>
              <View style={styles.officerWarningContent}>
                <Text style={styles.officerWarningTitle}>
                  Desktop Web Portal Required
                </Text>
                <Text style={styles.officerWarningText}>
                  Agricultural Officers and System Admins must access the City Web Portal on a desktop browser. The mobile app is strictly reserved for smallholder Farmers and field Development Agents (DAs).
                </Text>
              </View>
            </View>
          )}

          {/* Error Banner */}
          {displayError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {displayError}</Text>
            </View>
          ) : null}

          {/* Form Card */}
          <View style={[styles.formCard, Shadows.card]}>
            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {language === 'om' ? 'Maqaa Guutuu' : 'ሙሉ ስም'} • Full Name
                </Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Gudeta Feyissa"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    placeholderTextColor={Colors.light.textTertiary}
                  />
                </View>
              </View>
            )}

            {authMode !== 'da_invite' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {language === 'om' ? 'Lakkoofsa Bilbilaa' : 'ስልክ ቁጥር'} • Phone Number
                </Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📱</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="+251 91 123 4567"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    placeholderTextColor={Colors.light.textTertiary}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Invitation Token / የመጋበዣ ኮድ</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔑</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter DA token..."
                    value={inviteToken}
                    onChangeText={setInviteToken}
                    autoCapitalize="none"
                    placeholderTextColor={Colors.light.textTertiary}
                  />
                </View>
              </View>
            )}

            {authMode !== 'da_invite' && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>
                    {language === 'om' ? 'Jecha Icciitii' : 'የይለፍ ቃል'} • Password
                  </Text>
                  {authMode === 'signin' && (
                    <Pressable onPress={() => setAuthMode('forgot')}>
                      <Text style={styles.forgotLink}>
                        {language === 'om' ? 'Irraanfattee?' : 'ረስተዋል?'}
                      </Text>
                    </Pressable>
                  )}
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={authMode === 'signup' ? 'Min 10 chars (Aa1...)' : 'Enter password'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={Colors.light.textTertiary}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}>
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Primary Submit Button (56dp standard height) */}
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Submit form"
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                submitting && styles.submitButtonDisabled,
              ]}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {authMode === 'signin'
                    ? language === 'om'
                      ? 'Seeni (Sign In)'
                      : 'ይግቡ (Sign In)'
                    : authMode === 'signup'
                    ? language === 'om'
                      ? 'Koodii SMS Gaafadhu'
                      : 'የማረጋገጫ SMS ይላኩ'
                    : authMode === 'forgot'
                    ? 'Send Reset Code'
                    : 'Accept Invitation'}
                </Text>
              )}
            </Pressable>

            {/* Secondary Option Links */}
            <View style={styles.secondaryLinks}>
              {authMode !== 'da_invite' ? (
                <Pressable onPress={() => setAuthMode('da_invite')}>
                  <Text style={styles.secondaryLinkText}>
                    📋 Development Agent with Invite Token? Click here
                  </Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => setAuthMode('signin')}>
                  <Text style={styles.secondaryLinkText}>
                    ← Back to standard Sign In
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 20,
    color: Colors.light.text,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radii.full,
    gap: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  gatewayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: Radii.card,
    marginBottom: Spacing.three,
  },
  gatewayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gatewayIcon: {
    fontSize: 16,
  },
  gatewayText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  simBadge: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  simText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  langGuideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  activeLangPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    gap: 6,
  },
  langIcon: {
    fontSize: 14,
  },
  langName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  audioGuideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDBCE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    gap: 6,
  },
  audioGuideButtonActive: {
    backgroundColor: '#FF6F00',
  },
  audioGuideIcon: {
    fontSize: 16,
  },
  audioGuideLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A2D00',
  },
  titleCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  titleBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBadgeIcon: {
    fontSize: 24,
  },
  titleContent: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
  },
  subTitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radii.card,
    padding: 4,
    marginBottom: Spacing.three,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radii.medium,
  },
  tabButtonActive: {
    backgroundColor: Colors.light.card,
    ...Shadows.card,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: Colors.light.primaryDark,
  },
  officerWarningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderColor: '#FFB74D',
    borderWidth: 1.5,
    borderRadius: Radii.card,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  officerWarningIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  officerWarningContent: {
    flex: 1,
  },
  officerWarningTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E65100',
  },
  officerWarningText: {
    fontSize: 12,
    color: '#5D4037',
    marginTop: 2,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: Colors.light.dangerLight,
    padding: Spacing.three,
    borderRadius: Radii.medium,
    marginBottom: Spacing.three,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.danger,
  },
  formCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TouchTargets.minimum,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radii.medium,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '600',
  },
  eyeButton: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 16,
  },
  submitButton: {
    height: TouchTargets.primaryButton, // 56dp
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    ...Shadows.card,
  },
  submitButtonPressed: {
    backgroundColor: Colors.light.primaryHover,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryLinks: {
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  secondaryLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primaryDark,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
