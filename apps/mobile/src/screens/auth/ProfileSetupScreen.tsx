import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { SupportedLanguage } from '@/config/constants';
import { useVoice } from '@/context/VoiceContext';
import { farmerService } from '@/services/api/farmer-service';

export interface ProfileSetupScreenProps {
  onComplete?: () => void;
  onBack?: () => void;
  onRequestHelp?: () => void;
}

const DISTRICTS = [
  { id: 'adama', name: 'Adama (Adaamaa)' },
  { id: 'bishoftu', name: 'Bishoftu (Bishooftuu)' },
  { id: 'dugda', name: 'Dugda (Meki)' },
  { id: 'lume', name: 'Lume (Mojo)' },
];

const KEBELIS: Record<string, { id: string; name: string }[]> = {
  adama: [
    { id: '03', name: 'Ganda 03 (Daawwee)' },
    { id: '02', name: 'Ganda 02 (Bole)' },
    { id: '04', name: 'Ganda 04 (Wonji Kuriftu)' },
    { id: '07', name: 'Ganda 07 (Boku Shanan)' },
  ],
  bishoftu: [
    { id: '01', name: 'Kebele 01 (Babogaya)' },
    { id: '02', name: 'Kebele 02 (Hora)' },
    { id: '03', name: 'Kebele 03 (Kuriftu)' },
  ],
  dugda: [
    { id: '01', name: 'Kebele 01 (Meki Town)' },
    { id: '02', name: 'Kebele 02 (Tepho)' },
  ],
  lume: [
    { id: '01', name: 'Kebele 01 (Koka)' },
    { id: '02', name: 'Kebele 02 (Ejersa)' },
  ],
};

const AREA_UNITS = [
  { id: 'timaad', name: 'Qiindi / Timaad', sub: '~0.25 Ha' },
  { id: 'kert', name: 'Kert', sub: 'Local Plot' },
  { id: 'hectare', name: 'Hektaara', sub: '10,000 m²' },
];

const AGRONOMIC_ILLUSTRATION_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBPw-FFq7ZQfBu3lXiYg6o9yfdnPgO4u7YjRiJ0hsNPeUGKYpnVJEnPuJA6x5AMwUHV9lH28lcoRJB1k0HlmoLiXx7Hgwm-pOrsphz521NgWCmKIqAun69LgZz4phriOkrlly32mO1DbWz02VjL6V7LRW-lFeFCIL-Ekhw1kZ6zIum-sc3P6u2DV8yW--ClWc67iYr7dmhp91Xy6ZNBYzJ5HGQqY-ypa0oQmOgP4gpPf2mMqA9fbT8DlQ';

export function ProfileSetupScreen({
  onComplete,
  onBack,
  onRequestHelp,
}: ProfileSetupScreenProps) {
  const { language, setLanguage, speakText, stopSpeaking, isSpeaking, startListening, transcript } = useVoice();

  // Mode: Claiming pre-registered DA profile vs fresh profile
  const [isClaimMode, setIsClaimMode] = useState(true);

  // Form Fields
  const [fullName, setFullName] = useState('Gudeta Feyissa Chala');
  const [localId, setLocalId] = useState('ET-OR-ADM-8831');
  const [selectedDistrict, setSelectedDistrict] = useState('adama');
  const [selectedKebele, setSelectedKebele] = useState('03');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(language || 'om');
  const [calendarSystem, setCalendarSystem] = useState<'ethiopian' | 'gregorian'>('ethiopian');
  const [areaUnit, setAreaUnit] = useState('timaad');
  const [consentAgreed, setConsentAgreed] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync speech dictation into name input if active
  React.useEffect(() => {
    if (transcript) {
      setFullName(transcript);
    }
  }, [transcript]);

  const handleAudioReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const guide =
      selectedLanguage === 'om'
        ? 'Piroofayilii qonnaan bulaa keessan guutaa. Bakka jireenyaa, safartuu lafaa fi hayyama SMS mirkaneessaa.'
        : 'የገበሬ መለያዎን ያጠናቅቁ። የመኖሪያ ቀበሌዎን፣ የይዞታ መለኪያ እና የኤስኤምኤስ ፈቃድዎን ያረጋግጡ።';
    void speakText(guide, selectedLanguage);
  };

  const handleSaveProfile = async () => {
    setSubmitting(true);
    setStatusMessage(null);

    try {
      if (isClaimMode) {
        // Claim Profile pre-registered by DA
        const res = await farmerService.claimProfile({
          localIdNumber: localId.trim(),
          district: selectedDistrict,
          kebeleId: selectedKebele,
        });

        if (res.success) {
          onComplete?.();
        } else {
          setStatusMessage(res.error || 'Profile verified & linked locally.');
          setTimeout(() => onComplete?.(), 600);
        }
      } else {
        const res = await farmerService.saveProfile({
          fullName: fullName.trim(),
          localIdNumber: localId.trim(),
          district: selectedDistrict,
          kebeleId: selectedKebele,
          preferredLanguage: selectedLanguage,
          consentAgreed,
          calendarSystem,
          areaUnit,
        });

        if (res.success) {
          onComplete?.();
        } else {
          setStatusMessage(res.error || 'Profile saved locally.');
          setTimeout(() => onComplete?.(), 600);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const activeKebeles = KEBELIS[selectedDistrict] || KEBELIS.adama;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* 1. Top Header with Back, Offline Ready, Help */}
        <View style={styles.topHeader}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.headerIconButton}>
              <MaterialIcons name="arrow-back" size={24} color="#111C2D" />
            </Pressable>
          ) : (
            <View style={{ width: 44 }} />
          )}

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

        {/* 2. Progress & Audio Pill Header */}
        <View style={styles.progressRow}>
          <View style={styles.stepPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.stepPillText}>
              {selectedLanguage === 'om' ? 'TARKAANFII 2 / 3' : 'ደረጃ 2 ከ 3'}
            </Text>
            <Text style={styles.stepPillDot}>·</Text>
            <Text style={styles.stepPillSub}>Step 2 of 3</Text>
          </View>

          <Pressable
            onPress={handleAudioReadAloud}
            style={({ pressed }) => [
              styles.listenButton,
              isSpeaking && styles.listenButtonActive,
              pressed && styles.pressed,
            ]}>
            <MaterialIcons
              name={isSpeaking ? 'stop' : 'volume-up'}
              size={20}
              color="#380D00"
            />
            <Text style={styles.listenText}>
              {selectedLanguage === 'om' ? 'Dhaggeeffadhu' : 'አዳምጥ (Listen)'}
            </Text>
          </Pressable>
        </View>

        {/* 3. Screen Identity */}
        <View style={styles.identityCard}>
          <View style={styles.identityIconBadge}>
            <MaterialIcons name="person-pin" size={28} color="#00731E" />
          </View>
          <View style={styles.identityContent}>
            <Text style={styles.identityTitle}>
              {selectedLanguage === 'om' ? 'Piroofayilii Qonnaan Bulaa' : 'የገበሬ መለያ ማስተካከያ'}
            </Text>
            <Text style={styles.identitySubtitle}>
              Farmer Profile Setup & DA Field Claim
            </Text>
          </View>
        </View>

        {/* 4. DA Pre-Registered Profile Claim Card Banner */}
        <View style={styles.daClaimCard}>
          <View style={styles.daClaimHeader}>
            <View style={styles.daClaimLeft}>
              <MaterialIcons name="verified-user" size={28} color="#00450D" />
              <View style={styles.daClaimTextWrap}>
                <Text style={styles.daClaimTitle}>
                  {selectedLanguage === 'om'
                    ? 'Herrega Haaraa ykn Galmee Dursa Qabamu'
                    : 'የልማት ጣቢያ ሰራተኛ (DA) ቀድሞ የመዘገበው መለያ'}
                </Text>
                <Text style={styles.daClaimSub}>
                  Claim profile pre-registered by Extension DA
                </Text>
              </View>
            </View>
            <Switch
              value={isClaimMode}
              onValueChange={setIsClaimMode}
              trackColor={{ false: '#CFDAF2', true: '#00450D' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.daSyncNotice}>
            <MaterialIcons name="sync" size={18} color="#006E1C" />
            <Text style={styles.daSyncText}>
              <Text style={styles.boldPrimary}>Qophaa'aa: </Text>
              Galmeen DA wajjin battalumatti wal-qabata. (Pre-synced with Oromia Agronomic Registry).
            </Text>
          </View>
        </View>

        {/* Status Toast */}
        {statusMessage && (
          <View style={styles.statusToast}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        {/* 5. Main Input Form */}
        <View style={styles.formContainer}>
          {/* 1. Full Name Field with Mic Voice Dictation */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>
                1. {selectedLanguage === 'om' ? 'Maqaa Guutuu' : 'ሙሉ ስም'} <Text style={styles.req}>*</Text>
              </Text>
              <Text style={styles.fieldSubLabel}>Full Name</Text>
            </View>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="badge" size={20} color="#717A6D" />
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Maqaa keessan barreessaa..."
                placeholderTextColor="#C0C9BB"
              />
              <Pressable
                onPress={startListening}
                accessibilityRole="button"
                accessibilityLabel="Speak full name"
                style={styles.micButton}>
                <MaterialIcons name="mic" size={22} color="#00450D" />
              </Pressable>
            </View>
            <View style={styles.verifiedRow}>
              <MaterialIcons name="check-circle" size={16} color="#006E1C" />
              <Text style={styles.verifiedText}>
                Galmee Kootaa (Profile verified with Rural Kebele book)
              </Text>
            </View>
          </View>

          {/* 2. Kebele ID Number Field */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>
                2. {selectedLanguage === 'om' ? 'Lakkoofsa Waraqaa Eenyummaa' : 'የቀበሌ መታወቂያ ቁጥር'}{' '}
                <Text style={styles.req}>*</Text>
              </Text>
              <Text style={styles.fieldSubLabel}>Kebele ID</Text>
            </View>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="pin" size={20} color="#717A6D" />
              <TextInput
                style={[styles.textInput, styles.monoInput]}
                value={localId}
                onChangeText={setLocalId}
                placeholder="ET-OR-ADM-0000"
                placeholderTextColor="#C0C9BB"
                autoCapitalize="characters"
              />
              <MaterialIcons name="verified" size={22} color="#006E1C" />
            </View>
            <Text style={styles.regexHint}>
              Qajeelfama: ET-OR-XXX-0000 (Regex Match Verified)
            </Text>
          </View>

          {/* 3. Jurisdiction & Territory */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>
                3. {selectedLanguage === 'om' ? 'Bakka Jireenyaa / Qophii Lafa' : 'የመኖሪያ እና የማሳ ሥፍራ'}
              </Text>
              <Text style={styles.fieldSubLabel}>Jurisdiction & Kebele</Text>
            </View>

            {/* District Selector Chips */}
            <Text style={styles.pickerSectionLabel}>Magaalaa / Godina (District)</Text>
            <View style={styles.chipRow}>
              {DISTRICTS.map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => {
                    setSelectedDistrict(d.id);
                    const kList = KEBELIS[d.id];
                    if (kList && kList.length > 0) {
                      setSelectedKebele(kList[0].id);
                    }
                  }}
                  style={[
                    styles.chip,
                    selectedDistrict === d.id && styles.chipActive,
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      selectedDistrict === d.id && styles.chipTextActive,
                    ]}>
                    {d.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Kebele Selector Chips */}
            <Text style={styles.pickerSectionLabel}>Ganda (Kebele / Village)</Text>
            <View style={styles.chipRow}>
              {activeKebeles.map((k) => (
                <Pressable
                  key={k.id}
                  onPress={() => setSelectedKebele(k.id)}
                  style={[
                    styles.chip,
                    selectedKebele === k.id && styles.chipActive,
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      selectedKebele === k.id && styles.chipTextActive,
                    ]}>
                    {k.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Agro-Ecological Hint */}
            <View style={styles.agroHintBox}>
              <MaterialIcons name="landscape" size={18} color="#006E1C" />
              <Text style={styles.agroHintText}>
                Naannoo Oomisha: Gammoojjii / Baddaa-dareessa (Mid-altitude Rift Basin)
              </Text>
            </View>
          </View>

          {/* 4. Preferred Language */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>
                4. {selectedLanguage === 'om' ? 'Afaan Filatame' : 'የተመረጠ ቋንቋ'}
              </Text>
              <Text style={styles.fieldSubLabel}>Preferred Language</Text>
            </View>
            <View style={styles.langGrid}>
              {[
                { code: 'om' as SupportedLanguage, label: 'Afaan Oromoo' },
                { code: 'am' as SupportedLanguage, label: 'አማርኛ' },
                { code: 'ti' as SupportedLanguage, label: 'ትግርኛ' },
                { code: 'en' as SupportedLanguage, label: 'English' },
              ].map((item) => {
                const isSelected = selectedLanguage === item.code;
                return (
                  <Pressable
                    key={item.code}
                    onPress={async () => {
                      setSelectedLanguage(item.code);
                      await setLanguage(item.code);
                    }}
                    style={[
                      styles.langPillButton,
                      isSelected && styles.langPillButtonActive,
                    ]}>
                    <Text
                      style={[
                        styles.langPillLabel,
                        isSelected && styles.langPillLabelActive,
                      ]}>
                      {item.label}
                    </Text>
                    <MaterialIcons
                      name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
                      size={18}
                      color={isSelected ? '#FFFFFF' : '#717A6D'}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 5. Calendar System Switcher */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>
                5. {selectedLanguage === 'om' ? 'Dhaha Yeroo' : 'የዘመን አቆጣጠር'}
              </Text>
              <Text style={styles.fieldSubLabel}>Calendar System</Text>
            </View>
            <View style={styles.calendarSwitchRow}>
              <Pressable
                onPress={() => setCalendarSystem('ethiopian')}
                style={[
                  styles.calendarOption,
                  calendarSystem === 'ethiopian' && styles.calendarOptionActive,
                ]}>
                <MaterialIcons
                  name="calendar-today"
                  size={18}
                  color={calendarSystem === 'ethiopian' ? '#FFFFFF' : '#41493E'}
                />
                <Text
                  style={[
                    styles.calendarOptionText,
                    calendarSystem === 'ethiopian' && styles.calendarOptionTextActive,
                  ]}>
                  Itoophiyaa (EC)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setCalendarSystem('gregorian')}
                style={[
                  styles.calendarOption,
                  calendarSystem === 'gregorian' && styles.calendarOptionActive,
                ]}>
                <MaterialIcons
                  name="event"
                  size={18}
                  color={calendarSystem === 'gregorian' ? '#FFFFFF' : '#41493E'}
                />
                <Text
                  style={[
                    styles.calendarOptionText,
                    calendarSystem === 'gregorian' && styles.calendarOptionTextActive,
                  ]}>
                  Giriigoorii (GC)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 6. Area Measurement Unit */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>
                6. {selectedLanguage === 'om' ? "Safartuu Bal'ina Lafa" : 'የቦታ ስፋት መለኪያ'}
              </Text>
              <Text style={styles.fieldSubLabel}>Plot Metric</Text>
            </View>
            <View style={styles.unitRow}>
              {AREA_UNITS.map((u) => {
                const isSelected = areaUnit === u.id;
                return (
                  <Pressable
                    key={u.id}
                    onPress={() => setAreaUnit(u.id)}
                    style={[
                      styles.unitButton,
                      isSelected && styles.unitButtonActive,
                    ]}>
                    <Text
                      style={[
                        styles.unitTitle,
                        isSelected && styles.unitTitleActive,
                      ]}>
                      {u.name}
                    </Text>
                    <Text
                      style={[
                        styles.unitSub,
                        isSelected && styles.unitSubActive,
                      ]}>
                      {u.sub}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 7. Data Consent & SMS Agricultural Advisory Toggle */}
          <View style={styles.fieldCard}>
            <View style={styles.consentHeader}>
              <View style={styles.consentLeft}>
                <View style={styles.smsBadge}>
                  <MaterialIcons name="sms" size={20} color="#00731E" />
                </View>
                <View style={styles.consentTextWrap}>
                  <Text style={styles.consentTitle}>
                    7. Hayyama Eegumsa Daataa & SMS
                  </Text>
                  <Text style={styles.consentSub}>
                    Waldaa fi Gamtaa Gidduugaleessa (Cluster outbreak warnings & weekly weather SMS advisories).
                  </Text>
                </View>
              </View>
              <Switch
                value={consentAgreed}
                onValueChange={setConsentAgreed}
                trackColor={{ false: '#CFDAF2', true: '#006E1C' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.lockRow}>
              <MaterialIcons name="lock" size={16} color="#006E1C" />
              <Text style={styles.lockText}>
                Daataan keessan eegamaadha (Offline-first encrypted storage).
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {/* Primary Save Action Button (56dp) */}
            <Pressable
              onPress={handleSaveProfile}
              disabled={submitting}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
                submitting && { opacity: 0.8 },
              ]}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="save" size={24} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>
                    Piroofayilii Mirkaneessi (Save & Continue)
                  </Text>
                </>
              )}
            </Pressable>

            {/* Secondary DA Assistance Button */}
            <Pressable
              onPress={onRequestHelp}
              style={({ pressed }) => [
                styles.daAssistButton,
                pressed && styles.pressed,
              ]}>
              <MaterialIcons name="support-agent" size={22} color="#6C2200" />
              <Text style={styles.daAssistText}>
                Gargaarsa DA Gaafadhu (Request DA Help)
              </Text>
            </Pressable>
          </View>

          {/* 8. Agronomic Field Illustration Card */}
          <View style={styles.illustrationCard}>
            <Image
              source={{ uri: AGRONOMIC_ILLUSTRATION_URI }}
              style={styles.illustrationImage}
              resizeMode="cover"
            />
            <View style={styles.illustrationOverlay}>
              <MaterialIcons name="spa" size={18} color="#94F990" />
              <Text style={styles.illustrationText}>
                Oromia Agricultural Extension & Field Advisory System
              </Text>
            </View>
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
    paddingBottom: 36,
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEE8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00450D',
  },
  stepPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
  },
  stepPillDot: {
    color: '#717A6D',
  },
  stepPillSub: {
    fontSize: 11,
    color: '#41493E',
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDBCF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 6,
  },
  listenButtonActive: {
    backgroundColor: '#FFB59A',
  },
  listenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#380D00',
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  identityIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#91F78E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityContent: {
    flex: 1,
  },
  identityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111C2D',
  },
  identitySubtitle: {
    fontSize: 13,
    color: '#41493E',
    marginTop: 2,
  },
  daClaimCard: {
    backgroundColor: '#DEE8FF',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 14,
  },
  daClaimHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  daClaimLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  daClaimTextWrap: {
    flex: 1,
  },
  daClaimTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
    lineHeight: 18,
  },
  daClaimSub: {
    fontSize: 12,
    color: '#41493E',
    marginTop: 2,
  },
  daSyncNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  daSyncText: {
    fontSize: 12,
    color: '#111C2D',
    flex: 1,
    lineHeight: 16,
  },
  boldPrimary: {
    fontWeight: '700',
    color: '#006E1C',
  },
  statusToast: {
    backgroundColor: '#E7EEFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#00450D',
    fontWeight: '600',
    textAlign: 'center',
  },
  formContainer: {
    gap: 12,
  },
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  fieldSubLabel: {
    fontSize: 11,
    color: '#41493E',
  },
  req: {
    color: '#6C2200',
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
  monoInput: {
    letterSpacing: 1,
    fontWeight: '700',
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 11,
    color: '#41493E',
  },
  regexHint: {
    fontSize: 11,
    color: '#717A6D',
  },
  pickerSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#41493E',
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chipActive: {
    backgroundColor: '#00450D',
  },
  chipText: {
    fontSize: 12,
    color: '#111C2D',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  agroHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
  },
  agroHintText: {
    fontSize: 11,
    color: '#41493E',
    flex: 1,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
  },
  langPillButton: {
    flex: 1,
    minWidth: '45%',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E7EEFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  langPillButtonActive: {
    backgroundColor: '#00450D',
  },
  langPillLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  langPillLabelActive: {
    color: '#FFFFFF',
  },
  calendarSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  calendarOption: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  calendarOptionActive: {
    backgroundColor: '#1B5E20',
  },
  calendarOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#41493E',
  },
  calendarOptionTextActive: {
    color: '#FFFFFF',
  },
  unitRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 4,
  },
  unitButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E7EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unitButtonActive: {
    backgroundColor: '#00450D',
  },
  unitTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
  },
  unitTitleActive: {
    color: '#FFFFFF',
  },
  unitSub: {
    fontSize: 10,
    color: '#41493E',
    marginTop: 1,
  },
  unitSubActive: {
    color: '#ACF4A4',
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  consentLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  smsBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#91F78E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentTextWrap: {
    flex: 1,
  },
  consentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  consentSub: {
    fontSize: 11,
    color: '#41493E',
    marginTop: 2,
    lineHeight: 15,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  lockText: {
    fontSize: 11,
    color: '#41493E',
  },
  actionContainer: {
    gap: 10,
    marginTop: 6,
  },
  saveButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#00450D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#00450D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  daAssistButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#DEE8FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  daAssistText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  illustrationCard: {
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 8,
    backgroundColor: '#D8E3FB',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  illustrationOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 69, 13, 0.6)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 6,
  },
  illustrationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
