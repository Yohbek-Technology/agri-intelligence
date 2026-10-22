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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
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

const HERO_IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD9HPaJBxGbBSCHUMuGly-m_dV2bTd5FXebq93f8nuh8_slGFZ22ZKU3poGdBm4I19gcMBEjk8J3WWpvegG4jjNMCNdXrISjV58csW64avDFCdLodfB3xuou0h4qKIhp0M57JMWk1j360aEe_TRqdLonVegdcEt0lPHBP6vdV8VK0hrxvuBlhgQDHAECiJlC0LgZmBC2Z0pCcwYBTgMchekmcK5THfWgD0An6A39Lfj58WSZ2R064bagA';

export function SignInScreen({
  onSuccess,
  onNavigateToOtp,
  onBackToLanguage,
  onRequestHelp,
}: SignInScreenProps) {
  const { signInWithPhone, requestOtp, requestPasswordReset, error, clearError } = useAuth();
  const { language, speakText, stopSpeaking, isSpeaking } = useVoice();

  // Mode: 'signin' | 'signup' | 'forgot'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'da'>('farmer');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [officerWarning, setOfficerWarning] = useState(false);

  const handleAudioExplainer = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const guide =
      authMode === 'signin'
        ? language === 'om'
          ? 'Lakkoofsa bilbilaa fi jecha icciitii keessan galchuun seenaa. Osoo hin mallatteessin dura qonnaan bulaa ykn ogeessa DA filadhaa.'
          : 'ስልክ ቁጥርዎን እና የይለፍ ቃልዎን በማስገባት ይግቡ። ገበሬ ወይም የልማት ሰራተኛ መሆንዎን ይምረጡ።'
        : language === 'om'
        ? 'Galmee haaraa uumuuf maqaa fi lakkoofsa bilbilaa galchaa. Koodiin SMS isiniif ergama.'
        : 'አዲስ መለያ ለመክፈት ሙሉ ስም እና ስልክ ቁጥርዎን ያስገቡ። በSMS የማረጋገጫ ኮድ ይላክልዎታል።';
    void speakText(guide, language);
  };

  const handleTriggerVoiceHelp = () => {
    handleAudioExplainer();
  };

  const handleSubmit = async () => {
    clearError();
    setLocalError(null);
    setOfficerWarning(false);

    let cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }
    if (!cleanPhone.startsWith('+251')) {
      if (cleanPhone.startsWith('251')) {
        cleanPhone = '+' + cleanPhone;
      } else {
        cleanPhone = '+251' + cleanPhone;
      }
    }

    if (cleanPhone.length < 12) {
      setLocalError('Please enter a valid 9-digit Ethiopian mobile number.');
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
          setLocalError('Password must be at least 10 characters.');
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
          {/* 1. Top Offline & Telemetry Status Bar */}
          <View style={styles.statusBarRow}>
            <View style={styles.offlineCapablePill}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.offlineCapableText}>Local AI Active • Offline Capable</Text>
            </View>
            <View style={styles.networkDirectPill}>
              <MaterialIcons name="signal-cellular-alt" size={16} color="#41493E" />
              <Text style={styles.networkDirectText}>4G / SMS Direct</Text>
            </View>
          </View>

          {/* 2. Illiteracy-First Audio Explainer Banner */}
          <Pressable
            onPress={handleAudioExplainer}
            style={({ pressed }) => [
              styles.audioExplainerBanner,
              isSpeaking && styles.audioExplainerActive,
              pressed && styles.pressed,
            ]}>
            <View style={styles.audioBannerLeft}>
              <View style={styles.audioBannerIconCircle}>
                <MaterialIcons
                  name={isSpeaking ? 'stop' : 'volume-up'}
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.audioBannerTextGroup}>
                <Text style={styles.audioBannerTitle}>Listen to Instructions</Text>
                <Text style={styles.audioBannerSub}>የመግቢያ መመሪያዎችን ያዳምጡ</Text>
              </View>
            </View>
            <View style={styles.audioTimeBadge}>
              <Text style={styles.audioTimeText}>{isSpeaking ? 'Playing' : '44s Audio'}</Text>
            </View>
          </Pressable>

          {/* 3. Hero Image: Grounded Agrarian Trust */}
          <View style={styles.heroCard}>
            <Image
              source={{ uri: HERO_IMAGE_URI }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay}>
              <View style={styles.heroTitleRow}>
                <MaterialIcons name="eco" size={18} color="#94F990" />
                <Text style={styles.heroTitle}>Autonomous Agronomic Portal</Text>
              </View>
              <Text style={styles.heroSubtitle}>
                Oromia & Amhara Integrated Agro-Telemetry
              </Text>
            </View>
          </View>

          {/* 4. Role Selector Switch (Farmer vs DA) */}
          <View style={styles.roleContainer}>
            <Pressable
              onPress={() => setSelectedRole('farmer')}
              style={[
                styles.roleButton,
                selectedRole === 'farmer' && styles.roleButtonActive,
              ]}>
              <MaterialIcons
                name="agriculture"
                size={20}
                color={selectedRole === 'farmer' ? '#FFFFFF' : '#41493E'}
              />
              <Text
                style={[
                  styles.roleText,
                  selectedRole === 'farmer' && styles.roleTextActive,
                ]}>
                Farmer / አርሶ አደር
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedRole('da')}
              style={[
                styles.roleButton,
                selectedRole === 'da' && styles.roleButtonActive,
              ]}>
              <MaterialIcons
                name="engineering"
                size={20}
                color={selectedRole === 'da' ? '#FFFFFF' : '#41493E'}
              />
              <Text
                style={[
                  styles.roleText,
                  selectedRole === 'da' && styles.roleTextActive,
                ]}>
                DA / ኤክስቴንሽን
              </Text>
            </Pressable>
          </View>

          {/* 5. Mode Toggle: Sign In vs Create Account */}
          <View style={styles.modeContainer}>
            <Pressable
              onPress={() => {
                clearError();
                setLocalError(null);
                setOfficerWarning(false);
                setAuthMode('signin');
              }}
              style={[
                styles.modeButton,
                authMode === 'signin' && styles.modeButtonActive,
              ]}>
              <MaterialIcons
                name="login"
                size={18}
                color={authMode === 'signin' ? '#00450D' : '#41493E'}
              />
              <Text
                style={[
                  styles.modeText,
                  authMode === 'signin' && styles.modeTextActive,
                ]}>
                Sign In / ይግቡ
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                clearError();
                setLocalError(null);
                setOfficerWarning(false);
                setAuthMode('signup');
              }}
              style={[
                styles.modeButton,
                authMode === 'signup' && styles.modeButtonActive,
              ]}>
              <MaterialIcons
                name="person-add"
                size={18}
                color={authMode === 'signup' ? '#00450D' : '#41493E'}
              />
              <Text
                style={[
                  styles.modeText,
                  authMode === 'signup' && styles.modeTextActive,
                ]}>
                Create Account / ይመዝገቡ
              </Text>
            </Pressable>
          </View>

          {/* Officer Redirection Notice (SRS ADM-8) */}
          {officerWarning && (
            <View style={styles.officerWarningCard}>
              <MaterialIcons name="computer" size={24} color="#6C2200" />
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

          {/* Error Message Callout */}
          {displayError && !officerWarning && (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={20} color="#BA1A1A" />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          {/* 6. Form Fields Container */}
          <View style={styles.formContainer}>
            {/* If Signup: Full Name Field */}
            {authMode === 'signup' && (
              <View style={styles.inputCard}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Full Name / ሙሉ ስም</Text>
                  <Text style={styles.inputSub}>Official Farmer Record</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="badge" size={20} color="#717A6D" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Abebe Bekele"
                    placeholderTextColor="#C0C9BB"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Mobile Phone Number with +251 prefix */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <View style={styles.inputLabelWithIcon}>
                  <MaterialIcons name="call" size={18} color="#00450D" />
                  <Text style={styles.inputLabel}>Mobile Phone Number / የስልክ ቁጥር</Text>
                </View>
                <Text style={styles.inputSub}>Ethio Telecom / Safaricom</Text>
              </View>

              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.flagEmoji}>🇪🇹</Text>
                  <Text style={styles.countryCodeText}>+251</Text>
                </View>
                <TextInput
                  style={styles.phoneTextInput}
                  placeholder="91 234 5678"
                  placeholderTextColor="#C0C9BB"
                  keyboardType="phone-pad"
                  maxLength={11}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
                <Pressable
                  onPress={handleAudioExplainer}
                  style={styles.voiceDictateButton}>
                  <MaterialIcons name="mic" size={22} color="#00731E" />
                </Pressable>
              </View>
              <Text style={styles.inputHint}>
                Starts with 9... or 7... (9 digits without initial zero)
              </Text>
            </View>

            {/* Password Field */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <View style={styles.inputLabelWithIcon}>
                  <MaterialIcons name="lock" size={18} color="#00450D" />
                  <Text style={styles.inputLabel}>Password / የይለፍ ቃል</Text>
                </View>
                <Text style={styles.passwordMinCounter}>Min 10 characters</Text>
              </View>

              <View style={styles.passwordInputRow}>
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="••••••••••••"
                  placeholderTextColor="#C0C9BB"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordVisibilityButton}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color="#41493E"
                  />
                </Pressable>
              </View>

              {/* Password Strength Indicator Bars */}
              <View style={styles.passwordStrengthRow}>
                <View
                  style={[
                    styles.strengthBar,
                    password.length > 0 && { backgroundColor: '#1B5E20' },
                  ]}
                />
                <View
                  style={[
                    styles.strengthBar,
                    password.length >= 6 && { backgroundColor: '#1B5E20' },
                  ]}
                />
                <View
                  style={[
                    styles.strengthBar,
                    password.length >= 10 && { backgroundColor: '#006E1C' },
                  ]}
                />
                <Text style={styles.strengthText}>
                  {password.length >= 10 ? 'Strong PIN/Pass' : 'Standard PIN/Pass'}
                </Text>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.rememberForgotRow}>
              <Pressable
                onPress={() => setRememberDevice(!rememberDevice)}
                style={styles.rememberRow}>
                <MaterialIcons
                  name={rememberDevice ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color="#1B5E20"
                />
                <Text style={styles.rememberText}>Remember on this device</Text>
              </Pressable>

              <Pressable
                onPress={() => setAuthMode('forgot')}
                style={styles.forgotButton}>
                <MaterialIcons name="history-edu" size={16} color="#6C2200" />
                <Text style={styles.forgotText}>Forgot? / ረሱት?</Text>
              </Pressable>
            </View>

            {/* 7. Large High-Contrast Primary Submit Action (56dp) */}
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={({ pressed }) => [
                styles.primarySubmitButton,
                pressed && styles.pressed,
                submitting && { opacity: 0.8 },
              ]}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons
                    name={authMode === 'signup' ? 'person-add' : 'lock-open'}
                    size={22}
                    color="#FFFFFF"
                  />
                  <Text style={styles.primarySubmitText}>
                    {authMode === 'signup'
                      ? 'Create Account / ይመዝገቡ'
                      : authMode === 'forgot'
                      ? 'Send Reset Code / ኮድ ላክ'
                      : 'Sign In / ይግቡ'}
                  </Text>
                </>
              )}
            </Pressable>

            {/* 8. Quick Audio Assistance Tap Action */}
            <View style={styles.voiceHelpRow}>
              <Pressable
                onPress={handleTriggerVoiceHelp}
                style={({ pressed }) => [
                  styles.voiceHelpButton,
                  pressed && styles.pressed,
                ]}>
                <MaterialIcons name="support-agent" size={20} color="#6C2200" />
                <Text style={styles.voiceHelpText}>
                  Need Voice Help? • የድምፅ ድጋፍ ይፈልጋሉ?
                </Text>
              </Pressable>
            </View>

            {/* Back to Language Selection */}
            {onBackToLanguage && (
              <Pressable
                onPress={onBackToLanguage}
                style={styles.backLanguageButton}>
                <MaterialIcons name="arrow-back" size={16} color="#41493E" />
                <Text style={styles.backLanguageText}>
                  ቋንቋ ይቀይሩ / Change Language
                </Text>
              </Pressable>
            )}

            {/* 9. Prominent Administrative Portal Advisory Notice */}
            <View style={styles.adminNoticeCard}>
              <View style={styles.adminNoticeIconCircle}>
                <MaterialIcons name="admin-panel-settings" size={22} color="#6C2200" />
              </View>
              <View style={styles.adminNoticeContent}>
                <View style={styles.adminNoticeHeader}>
                  <Text style={styles.adminNoticeTitle}>Administrative Access Notice</Text>
                  <View style={styles.govBadge}>
                    <Text style={styles.govBadgeText}>Gov / SRS ADM-8</Text>
                  </View>
                </View>
                <Text style={styles.adminNoticeText}>
                  Development Agents and Agronomic Experts only. System activity is cryptographically signed and synced to the regional agricultural bureau.
                </Text>
              </View>
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
    backgroundColor: '#F9F9FF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  statusBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  offlineCapablePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#91F78E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 6,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#006E1C',
  },
  offlineCapableText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00731E',
  },
  networkDirectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEE8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  networkDirectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#41493E',
  },
  audioExplainerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFDBCF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  audioExplainerActive: {
    backgroundColor: '#FFB59A',
  },
  audioBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  audioBannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C2200',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioBannerTextGroup: {
    flex: 1,
  },
  audioBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#380D00',
  },
  audioBannerSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#933100',
    marginTop: 2,
  },
  audioTimeBadge: {
    backgroundColor: '#6C2200',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  audioTimeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  heroCard: {
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
    backgroundColor: '#D8E3FB',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 69, 13, 0.65)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#90D689',
    marginTop: 2,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#DEE8FF',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  roleButtonActive: {
    backgroundColor: '#00450D',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#41493E',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  modeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F3FF',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#41493E',
  },
  modeTextActive: {
    fontWeight: '700',
    color: '#111C2D',
  },
  formContainer: {
    gap: 12,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  inputSub: {
    fontSize: 11,
    color: '#41493E',
  },
  passwordMinCounter: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C2200',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    padding: 6,
    gap: 8,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8E3FB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  flagEmoji: {
    fontSize: 14,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111C2D',
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111C2D',
    letterSpacing: 1,
    paddingVertical: 4,
  },
  voiceDictateButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#91F78E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputHint: {
    fontSize: 11,
    color: '#41493E',
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  passwordTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111C2D',
    letterSpacing: 2,
    paddingVertical: 8,
  },
  passwordVisibilityButton: {
    padding: 6,
  },
  passwordStrengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  strengthBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D8E3FB',
  },
  strengthText: {
    fontSize: 11,
    color: '#41493E',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111C2D',
    paddingVertical: 8,
  },
  rememberForgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    fontSize: 12,
    color: '#111C2D',
  },
  forgotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C2200',
  },
  primarySubmitButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#00450D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#00450D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 6,
  },
  primarySubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  voiceHelpRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  voiceHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEE8FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
  },
  voiceHelpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111C2D',
  },
  backLanguageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  backLanguageText: {
    fontSize: 12,
    color: '#41493E',
  },
  adminNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E7EEFF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: 8,
  },
  adminNoticeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D8E3FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminNoticeContent: {
    flex: 1,
  },
  adminNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  adminNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  govBadge: {
    backgroundColor: '#CFDAF2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  govBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#41493E',
    textTransform: 'uppercase',
  },
  adminNoticeText: {
    fontSize: 11,
    color: '#41493E',
    lineHeight: 15,
  },
  officerWarningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFDBCF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 8,
  },
  officerWarningContent: {
    flex: 1,
  },
  officerWarningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C2200',
    marginBottom: 2,
  },
  officerWarningText: {
    fontSize: 12,
    color: '#380D00',
    lineHeight: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDAD6',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#BA1A1A',
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
