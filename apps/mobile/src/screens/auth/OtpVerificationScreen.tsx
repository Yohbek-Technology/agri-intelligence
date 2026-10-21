import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';
import { useAuth } from '@/context/AuthContext';
import { useVoice } from '@/context/VoiceContext';
import { authService } from '@/services/api/auth-service';

export interface OtpVerificationScreenProps {
  phoneNumber: string;
  name?: string;
  password?: string;
  isPasswordReset?: boolean;
  onSuccess?: () => void;
  onBack?: () => void;
  onRequestHelp?: () => void;
}

export function OtpVerificationScreen({
  phoneNumber,
  name,
  password,
  isPasswordReset = false,
  onSuccess,
  onBack,
  onRequestHelp,
}: OtpVerificationScreenProps) {
  const { verifyOtpAndSignUp, resetPassword, error, clearError } = useAuth();
  const { language, speakText, stopSpeaking, isSpeaking, startListening, isListening, transcript } = useVoice();

  const [digits, setDigits] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(105); // 01:45
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [resending, setResending] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  // Voice transcript listener for digits
  useEffect(() => {
    if (transcript) {
      const extractedDigits = transcript.replace(/\D/g, '').slice(0, 6);
      if (extractedDigits.length > 0) {
        setDigits(extractedDigits.split(''));
      }
    }
  }, [transcript]);

  const handleKeyPress = (val: string) => {
    setLocalError(null);
    clearError();

    if (val === 'backspace') {
      setDigits((prev) => prev.slice(0, -1));
      return;
    }

    if (val === 'audio_readback') {
      const codeStr = digits.length > 0 ? digits.join(', ') : 'No digits entered yet';
      const prompt = language === 'om'
        ? `Koodiin amma jiru: ${codeStr}`
        : language === 'ti'
        ? `ዝኣተወ ኮድ: ${codeStr}`
        : language === 'en'
        ? `Entered code: ${codeStr}`
        : `ያስገቡት ኮድ: ${codeStr}`;
      void speakText(prompt, language);
      return;
    }

    if (digits.length < 6) {
      setDigits((prev) => [...prev, val]);
    }
  };

  const handleVerify = async () => {
    if (digits.length < 6) {
      setLocalError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (attemptsUsed >= 5) {
      setLocalError('Maximum verification attempts exceeded. Please request a new code.');
      return;
    }

    setSubmitting(true);
    setLocalError(null);
    clearError();

    const code = digits.join('');

    try {
      if (isPasswordReset) {
        if (!password) {
          setLocalError('Password missing for reset operation.');
          return;
        }
        const res = await resetPassword({
          phoneNumber,
          code,
          newPassword: password,
          confirmPassword: password,
        });
        if (res.success) {
          onSuccess?.();
        } else {
          setAttemptsUsed((prev) => prev + 1);
          setLocalError(res.error || 'Verification code invalid.');
        }
      } else {
        const res = await verifyOtpAndSignUp({
          phoneNumber,
          code,
          name,
          password,
          preferredLanguage: language,
        });
        if (res.success) {
          onSuccess?.();
        } else {
          setAttemptsUsed((prev) => prev + 1);
          setLocalError(res.error || 'Verification code invalid.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (secondsRemaining > 0 || resending) return;
    setResending(true);
    setLocalError(null);
    try {
      const res = await authService.resendOtp(phoneNumber);
      if (res.success) {
        setSecondsRemaining(105);
        setAttemptsUsed(0);
        setDigits([]);
      } else {
        setLocalError(res.error || 'Failed to resend SMS code.');
      }
    } finally {
      setResending(false);
    }
  };

  const handleAudioGuide = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const guide = language === 'om'
      ? 'Koodii mirkaneessaa digit ja\'aa ergame galchaa. Koodii sagaleen dubbachuu dandeessu.'
      : language === 'ti'
      ? 'ዝተልኣኸ ሽዱሽተ ድጂት ዘለዎ ናይ ምርግጋፅ ኮድ የእትዉ።'
      : language === 'en'
      ? 'Enter the 6-digit verification code sent to your phone. You can also speak the digits aloud.'
      : 'ወደ ስልክዎ የተላከውን ባለ 6 አሃዝ ማረጋገጫ ኮድ ያስገቡ። በድምፅም መናገር ይችላሉ።';
    void speakText(guide, language);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Top Header Ribbon */}
        <View style={styles.topHeader}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
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
            accessibilityLabel="Get help"
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

        {/* Language & Audio Guide Pill Row */}
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
              {language === 'om'
                ? 'Sagalee Dhaggeeffadhu (40s)'
                : language === 'ti'
                ? 'ድምፂ ስምዑ'
                : language === 'en'
                ? 'Audio Guide (40s)'
                : 'የድምፅ መመሪያ (40s)'}
            </Text>
          </Pressable>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, Shadows.card]}>
          <View style={styles.infoRow}>
            <View style={styles.envelopeBadge}>
              <Text style={styles.envelopeIcon}>✉️</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                {language === 'om' ? 'Koodii Mirkaneessaa Galchaa' : 'ምስጢራዊ ኮድ ያስገቡ'}
              </Text>
              <Text style={styles.infoSubtitle}>
                {language === 'om'
                  ? 'ምስጢራዊ ኮድ ያስገቡ • Enter 6-Digit Code'
                  : 'Enter 6-Digit SMS Verification Code'}
              </Text>
              <View style={styles.phoneBadge}>
                <Text style={styles.phoneIcon}>📱</Text>
                <Text style={styles.phoneText}>{phoneNumber || '+251 91 234 5678'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Error Display */}
        {displayError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {displayError}</Text>
          </View>
        ) : null}

        {/* 6 OTP Display Slots with 34sp typography */}
        <View style={styles.otpSlotsContainer}>
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const digit = digits[index];
            const isCurrent = digits.length === index;
            const isFilled = digit !== undefined;

            return (
              <View
                key={index}
                style={[
                  styles.otpSlot,
                  isFilled && styles.otpSlotFilled,
                  isCurrent && styles.otpSlotCurrent,
                ]}>
                <Text style={styles.otpSlotDigit}>{digit !== undefined ? digit : isCurrent ? '|' : '•'}</Text>
              </View>
            );
          })}
        </View>

        {/* Timer & Attempt Counter */}
        <View style={styles.metaRow}>
          <View style={styles.timerWrap}>
            <Text style={styles.timerIcon}>⏱️</Text>
            {secondsRemaining > 0 ? (
              <Text style={styles.timerText}>
                {language === 'om' ? "Deebi'ee haa ergamu: " : 'ኮድ መልሶ ለመላክ: '}
                <Text style={styles.timerValue}>{timerStr}</Text>
              </Text>
            ) : (
              <Pressable onPress={handleResend} disabled={resending}>
                <Text style={styles.resendLink}>
                  {resending ? 'Sending...' : 'ኮድ መልሰው ይላኩ / Resend SMS'}
                </Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.attemptsText}>Attempts: {attemptsUsed} of 5</Text>
        </View>

        {/* Speak Digits Voice Assistant Button */}
        <Pressable
          onPress={startListening}
          style={({ pressed }) => [
            styles.voiceAssistantButton,
            isListening && styles.voiceAssistantButtonActive,
            pressed && styles.pressed,
          ]}>
          <View style={styles.voiceMicCircle}>
            <Text style={styles.voiceMicIcon}>🎙️</Text>
          </View>
          <View style={styles.voiceTextWrap}>
            <Text style={styles.voiceButtonTitle}>
              {language === 'om' ? 'Sagaleen dubbadhaa' : 'በድምፅ ይናገሩ'}
            </Text>
            <Text style={styles.voiceButtonSubtitle}>
              {language === 'om'
                ? 'Speak digits with voice assistant • በድምፅ ይናገሩ'
                : 'Speak 6 digits clearly into the microphone'}
            </Text>
          </View>
        </Pressable>

        {/* Tactile 3x4 Numeric Keypad */}
        <View style={[styles.keypadContainer, Shadows.card]}>
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((n) => (
              <Pressable
                key={n}
                onPress={() => handleKeyPress(n)}
                style={({ pressed }) => [styles.keypadButton, pressed && styles.keypadButtonPressed]}>
                <Text style={styles.keypadNumber}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {['4', '5', '6'].map((n) => (
              <Pressable
                key={n}
                onPress={() => handleKeyPress(n)}
                style={({ pressed }) => [styles.keypadButton, pressed && styles.keypadButtonPressed]}>
                <Text style={styles.keypadNumber}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {['7', '8', '9'].map((n) => (
              <Pressable
                key={n}
                onPress={() => handleKeyPress(n)}
                style={({ pressed }) => [styles.keypadButton, pressed && styles.keypadButtonPressed]}>
                <Text style={styles.keypadNumber}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {/* Audio Readback Key */}
            <Pressable
              onPress={() => handleKeyPress('audio_readback')}
              accessibilityRole="button"
              accessibilityLabel="Audio readback of entered digits"
              style={({ pressed }) => [
                styles.keypadButton,
                styles.keypadActionAudio,
                pressed && styles.keypadButtonPressed,
              ]}>
              <Text style={styles.keypadActionIcon}>👂</Text>
            </Pressable>

            {/* Digit 0 */}
            <Pressable
              onPress={() => handleKeyPress('0')}
              style={({ pressed }) => [styles.keypadButton, pressed && styles.keypadButtonPressed]}>
              <Text style={styles.keypadNumber}>0</Text>
            </Pressable>

            {/* Backspace Key */}
            <Pressable
              onPress={() => handleKeyPress('backspace')}
              accessibilityRole="button"
              accessibilityLabel="Delete digit"
              style={({ pressed }) => [
                styles.keypadButton,
                styles.keypadActionDelete,
                pressed && styles.keypadButtonPressed,
              ]}>
              <Text style={styles.keypadActionIcon}>⌫</Text>
            </Pressable>
          </View>
        </View>

        {/* Primary Verify CTA Button (56dp height) */}
        <Pressable
          onPress={handleVerify}
          disabled={submitting || digits.length < 6}
          accessibilityRole="button"
          accessibilityLabel="Verify and continue"
          style={({ pressed }) => [
            styles.verifyButton,
            (submitting || digits.length < 6) && styles.verifyButtonDisabled,
            pressed && styles.verifyButtonPressed,
          ]}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.verifyContent}>
              <Text style={styles.verifyIcon}>✅</Text>
              <Text style={styles.verifyText}>
                {language === 'om'
                  ? 'Mirkaneessi • Verify & Continue'
                  : 'አረጋግጥ • Verify & Continue'}
              </Text>
            </View>
          )}
        </Pressable>

        {/* USSD & DA Assistance Callout Card */}
        <View style={styles.helpCard}>
          <Text style={styles.helpCardIcon}>🤝</Text>
          <View style={styles.helpCardContent}>
            <Text style={styles.helpCardTitle}>
              {language === 'om'
                ? "Koodiin isin hin geenye? / SMS didn't arrive?"
                : "ኮዱ አልደረሰዎትም? / SMS didn't arrive?"}
            </Text>
            <Text style={styles.helpCardSubtitle}>
              Bilbilaan USSD <Text style={styles.helpUssdHighlight}>*804#</Text> cuqaasaa yookiin ogeessa qonnaa DA naannoo keessanii qunnamaa.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  envelopeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  envelopeIcon: {
    fontSize: 22,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  infoSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  phoneIcon: {
    fontSize: 14,
  },
  phoneText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.primaryDark,
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
  otpSlotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: Spacing.two,
  },
  otpSlot: {
    flex: 1,
    height: 64,
    borderRadius: Radii.card,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  otpSlotFilled: {
    backgroundColor: Colors.light.card,
    borderColor: Colors.light.primary,
  },
  otpSlotCurrent: {
    borderColor: Colors.light.primary,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  otpSlotDigit: {
    fontSize: 30, // 34sp typography
    fontWeight: '800',
    color: Colors.light.primaryDark,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
    paddingHorizontal: 4,
  },
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerIcon: {
    fontSize: 14,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  timerValue: {
    fontWeight: '800',
    color: '#8A2D00',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  attemptsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  voiceAssistantButton: {
    backgroundColor: Colors.light.primarySubtle,
    borderRadius: Radii.card,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  voiceAssistantButtonActive: {
    backgroundColor: '#FFECB3',
    borderColor: '#FFA000',
  },
  voiceMicCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceMicIcon: {
    fontSize: 20,
  },
  voiceTextWrap: {
    flex: 1,
  },
  voiceButtonTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.primaryDark,
  },
  voiceButtonSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  keypadContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keypadButton: {
    flex: 1,
    height: 56, // Tactile large hit area
    borderRadius: Radii.medium,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadButtonPressed: {
    backgroundColor: Colors.light.primarySubtle,
  },
  keypadNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  keypadActionAudio: {
    backgroundColor: '#FFDBCE',
  },
  keypadActionDelete: {
    backgroundColor: Colors.light.backgroundElement,
  },
  keypadActionIcon: {
    fontSize: 22,
    color: Colors.light.text,
  },
  verifyButton: {
    height: TouchTargets.primaryButton, // 56dp
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
    ...Shadows.card,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonPressed: {
    backgroundColor: Colors.light.primaryHover,
  },
  verifyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyIcon: {
    fontSize: 18,
  },
  verifyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.three,
    borderRadius: Radii.card,
    gap: Spacing.three,
  },
  helpCardIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  helpCardContent: {
    flex: 1,
  },
  helpCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
  },
  helpCardSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  helpUssdHighlight: {
    fontWeight: '800',
    color: Colors.light.primary,
  },
  pressed: {
    opacity: 0.8,
  },
});
