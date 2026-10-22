import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
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

  const [digits, setDigits] = useState<string[]>(['4', '8', '1', '9']);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(105); // 01:45
  const [attemptsUsed, setAttemptsUsed] = useState(4);
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

    if (val === 'audio') {
      const codeStr = digits.length > 0 ? digits.join(', ') : 'No digits entered yet';
      const prompt =
        language === 'om'
          ? `Koodiin amma jiru: ${codeStr}`
          : language === 'ti'
          ? `ዝኣተወ ኮድ: ${codeStr}`
          : language === 'en'
          ? `Current entered code is: ${codeStr}`
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
      setLocalError('Please enter all 6 digits of the verification code.');
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
    const guide =
      language === 'om'
        ? "Koodii mirkaneessaa digit ja'aa bilbila keessan irratti ergame galchaa. Koodii sagaleen dubbachuu dandeessu."
        : language === 'ti'
        ? 'ዝተልኣኸ ሽዱሽተ ድጂት ዘለዎ ናይ ምርግጋፅ ኮድ የእትዉ።'
        : language === 'en'
        ? 'Enter the 6-digit verification code sent to your phone. You can speak the digits aloud.'
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
        {/* 1. Header with Back, Offline Ready, Help */}
        <View style={styles.topHeader}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.headerIconButton}>
            <MaterialIcons name="arrow-back" size={24} color="#111C2D" />
          </Pressable>

          <View style={styles.offlinePill}>
            <View style={styles.greenDot} />
            <Text style={styles.offlineText}>Offline Ready</Text>
          </View>

          <Pressable
            onPress={onRequestHelp}
            accessibilityRole="button"
            accessibilityLabel="Help"
            style={styles.headerIconButton}>
            <MaterialIcons name="help" size={24} color="#111C2D" />
          </Pressable>
        </View>

        {/* 2. Sub-Ribbon: Offline Capable & SMS Direct Gateway */}
        <View style={styles.gatewayBanner}>
          <View style={styles.gatewayLeft}>
            <MaterialIcons name="signal-cellular-alt" size={20} color="#006E1C" />
            <Text style={styles.gatewayText}>Offline Capable • SMS Direct Gateway</Text>
          </View>
          <View style={styles.simBadge}>
            <Text style={styles.simText}>SIM 1</Text>
          </View>
        </View>

        {/* 3. Language & Audio Guide Trigger Row */}
        <View style={styles.langGuideRow}>
          <View style={styles.langPill}>
            <MaterialIcons name="translate" size={18} color="#00450D" />
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
            <MaterialIcons
              name={isSpeaking ? 'stop' : 'volume-up'}
              size={20}
              color="#380D00"
            />
            <Text style={styles.audioGuideLabel}>
              {language === 'om'
                ? 'Sagalee Dhaggeeffadhu (40s)'
                : language === 'ti'
                ? 'ድምፂ ስምዑ (40s)'
                : language === 'en'
                ? 'Audio Guide (40s)'
                : 'የድምፅ መመሪያ (40s)'}
            </Text>
          </Pressable>
        </View>

        {/* 4. Verification Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.emailBadge}>
              <MaterialIcons name="mark-email-read" size={28} color="#00731E" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Koodii Mirkaneessaa Galchaa</Text>
              <Text style={styles.infoSubtitle}>
                ምስጢራዊ ኮድ ያስገቡ • Enter 6-Digit Code
              </Text>
              <View style={styles.phoneBadge}>
                <MaterialIcons name="phone-iphone" size={18} color="#006E1C" />
                <Text style={styles.phoneText}>
                  {phoneNumber || '+251 91 234 5678'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Error Callout */}
        {displayError ? (
          <View style={styles.errorBox}>
            <MaterialIcons name="error-outline" size={18} color="#BA1A1A" />
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        ) : null}

        {/* 5. 6 Large OTP Display Boxes */}
        <View style={styles.otpBoxesRow}>
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const digit = digits[index];
            const isCurrent = digits.length === index;
            const isFilled = digit !== undefined;

            return (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  isFilled ? styles.otpBoxFilled : styles.otpBoxEmpty,
                  isCurrent && styles.otpBoxCurrent,
                ]}>
                <Text
                  style={[
                    styles.otpBoxDigit,
                    isFilled ? styles.otpBoxDigitFilled : styles.otpBoxDigitEmpty,
                  ]}>
                  {digit !== undefined ? digit : isCurrent ? '|' : '•'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* 6. Timer & Attempt Counter */}
        <View style={styles.metaRow}>
          <View style={styles.timerWrap}>
            <MaterialIcons name="schedule" size={18} color="#6C2200" />
            {secondsRemaining > 0 ? (
              <Text style={styles.timerText}>
                Deebi'ee haa ergamu: <Text style={styles.timerValue}>{timerStr}</Text>
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

        {/* 7. Big Voice Assistant Speak Digits Button */}
        <Pressable
          onPress={startListening}
          style={({ pressed }) => [
            styles.voiceAssistantButton,
            isListening && styles.voiceAssistantButtonActive,
            pressed && styles.pressed,
          ]}>
          <View style={styles.voiceMicCircle}>
            <MaterialIcons name="mic" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.voiceTextWrap}>
            <Text style={styles.voiceButtonTitle}>Sagaleen dubbadhaa</Text>
            <Text style={styles.voiceButtonSubtitle}>
              Speak digits with voice assistant • በድምፅ ይናገሩ
            </Text>
          </View>
        </Pressable>

        {/* 8. Tactile 3x4 On-Screen Keypad for Field Operability */}
        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((n) => (
              <Pressable
                key={n}
                onPress={() => handleKeyPress(n)}
                style={({ pressed }) => [
                  styles.keypadKey,
                  pressed && styles.keypadKeyPressed,
                ]}>
                <Text style={styles.keypadKeyNumber}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {['4', '5', '6'].map((n) => (
              <Pressable
                key={n}
                onPress={() => handleKeyPress(n)}
                style={({ pressed }) => [
                  styles.keypadKey,
                  pressed && styles.keypadKeyPressed,
                ]}>
                <Text style={styles.keypadKeyNumber}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {['7', '8', '9'].map((n) => (
              <Pressable
                key={n}
                onPress={() => handleKeyPress(n)}
                style={({ pressed }) => [
                  styles.keypadKey,
                  pressed && styles.keypadKeyPressed,
                ]}>
                <Text style={styles.keypadKeyNumber}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {/* Audio Readback Trigger */}
            <Pressable
              onPress={() => handleKeyPress('audio')}
              accessibilityRole="button"
              accessibilityLabel="Audio readback"
              style={({ pressed }) => [
                styles.keypadKey,
                styles.keypadKeyAudio,
                pressed && styles.keypadKeyPressed,
              ]}>
              <MaterialIcons name="hearing" size={26} color="#380D00" />
            </Pressable>

            {/* Zero Key */}
            <Pressable
              onPress={() => handleKeyPress('0')}
              style={({ pressed }) => [
                styles.keypadKey,
                pressed && styles.keypadKeyPressed,
              ]}>
              <Text style={styles.keypadKeyNumber}>0</Text>
            </Pressable>

            {/* Backspace Key */}
            <Pressable
              onPress={() => handleKeyPress('backspace')}
              accessibilityRole="button"
              accessibilityLabel="Delete digit"
              style={({ pressed }) => [
                styles.keypadKey,
                styles.keypadKeyDelete,
                pressed && styles.keypadKeyPressed,
              ]}>
              <MaterialIcons name="backspace" size={24} color="#BA1A1A" />
            </Pressable>
          </View>
        </View>

        {/* 9. Primary Action Submit Button (56dp) */}
        <Pressable
          onPress={handleVerify}
          disabled={submitting}
          style={({ pressed }) => [
            styles.verifySubmitButton,
            pressed && styles.pressed,
            submitting && { opacity: 0.8 },
          ]}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="verified" size={24} color="#FFFFFF" />
              <Text style={styles.verifySubmitText}>
                Mirkaneessi • Verify & Continue
              </Text>
            </>
          )}
        </Pressable>

        {/* 10. Footer USSD Direct Helper */}
        <View style={styles.ussdFooterCard}>
          <MaterialIcons name="contact-support" size={22} color="#006E1C" />
          <View style={styles.ussdContent}>
            <Text style={styles.ussdTitle}>
              Koodiin isin hin geenye? / SMS didn't arrive?
            </Text>
            <Text style={styles.ussdText}>
              Bilbilaan USSD <Text style={styles.ussdCode}>*804#</Text> cuqaasaa yookiin ogeessa qonnaa DA naannoo keessanii qunnamaa.
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
    backgroundColor: '#F9F9FF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 4,
  },
  headerIconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7EEFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#006E1C',
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#41493E',
  },
  gatewayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  gatewayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gatewayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111C2D',
  },
  simBadge: {
    backgroundColor: '#E7EEFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  simText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#41493E',
  },
  langGuideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8E3FB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 6,
  },
  langName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
  },
  audioGuideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDBCF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 6,
  },
  audioGuideButtonActive: {
    backgroundColor: '#FFB59A',
  },
  audioGuideLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#380D00',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  emailBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#91F78E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111C2D',
  },
  infoSubtitle: {
    fontSize: 12,
    color: '#41493E',
    marginTop: 2,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDAD6',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#BA1A1A',
    flex: 1,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 10,
  },
  otpBox: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    backgroundColor: '#DEE8FF',
  },
  otpBoxEmpty: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EEFF',
  },
  otpBoxCurrent: {
    borderColor: '#00450D',
    borderWidth: 2,
  },
  otpBoxDigit: {
    fontSize: 26,
    fontWeight: '800',
  },
  otpBoxDigitFilled: {
    color: '#00450D',
  },
  otpBoxDigitEmpty: {
    color: '#717A6D',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#41493E',
  },
  timerValue: {
    color: '#6C2200',
    fontWeight: '800',
  },
  resendLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00450D',
    textDecorationLine: 'underline',
  },
  attemptsText: {
    fontSize: 12,
    color: '#717A6D',
  },
  voiceAssistantButton: {
    backgroundColor: '#91F78E',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  voiceAssistantButtonActive: {
    backgroundColor: '#78DC77',
  },
  voiceMicCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#006E1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTextWrap: {
    flex: 1,
  },
  voiceButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#002204',
  },
  voiceButtonSubtitle: {
    fontSize: 11,
    color: '#005313',
    marginTop: 1,
  },
  keypadContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    gap: 8,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keypadKey: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E7EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyPressed: {
    backgroundColor: '#78DC77',
  },
  keypadKeyNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111C2D',
  },
  keypadKeyAudio: {
    backgroundColor: '#FFDBCF',
  },
  keypadKeyDelete: {
    backgroundColor: '#E7EEFF',
  },
  verifySubmitButton: {
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
    marginBottom: 14,
  },
  verifySubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ussdFooterCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F3FF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  ussdContent: {
    flex: 1,
  },
  ussdTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
  },
  ussdText: {
    fontSize: 11,
    color: '#41493E',
    marginTop: 2,
    lineHeight: 16,
  },
  ussdCode: {
    fontWeight: '800',
    color: '#00450D',
  },
  pressed: {
    opacity: 0.85,
  },
});
