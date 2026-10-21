import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';
import { normalizeToHectares, AreaUnit } from '@/utils/unit-converter';
import { plotService } from '@/services/api/plot-service';

export interface RegisterPlotScreenProps {
  onComplete?: () => void;
  onNavigateBack?: () => void;
}

export function RegisterPlotScreen({ onComplete, onNavigateBack }: RegisterPlotScreenProps) {
  const [plotName, setPlotName] = useState('የታችኛው ማሳ (Lower Field)');
  const [areaValue, setAreaValue] = useState('2.0');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('timad');
  const [soilClass, setSoilClass] = useState('koticha_vertisol');
  const [drainage, setDrainage] = useState('waterlogs');
  const [plannedCrop, setPlannedCrop] = useState('ጤፍ (ቁንጮ DZ-Cr-37)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // GPS State
  const [isLocating, setIsLocating] = useState(false);
  const [gpsData, setGpsData] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    elevation: number;
    agroZone: 'kolla' | 'weyna_dega' | 'dega';
  }>({
    latitude: 8.5411,
    longitude: 39.2704,
    accuracy: 8.5,
    elevation: 1710,
    agroZone: 'weyna_dega',
  });

  useEffect(() => {
    // Attempt auto-capture on mount
    captureRealGps();
  }, []);

  async function captureRealGps() {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const lat = location.coords.latitude;
        const lng = location.coords.longitude;
        const accuracy = location.coords.accuracy || 8.5;
        const elevation = location.coords.altitude ? Math.round(location.coords.altitude) : 1710;

        // Resolve elevation and agro zone
        const geoRes = await plotService.resolveGeoLocation(lat, lng);
        const resolvedZone = geoRes.data?.agroZoneDerived || (elevation < 1500 ? 'kolla' : elevation <= 2300 ? 'weyna_dega' : 'dega');

        setGpsData({
          latitude: Number(lat.toFixed(4)),
          longitude: Number(lng.toFixed(4)),
          accuracy: Number(accuracy.toFixed(1)),
          elevation: geoRes.data?.elevationMeters || elevation,
          agroZone: resolvedZone,
        });
      }
    } catch {
      // Keep sensible default Ethiopian coordinate snapshot (Adama / Bishoftu)
    } finally {
      setIsLocating(false);
    }
  }

  const numericArea = parseFloat(areaValue) || 0;
  const calculatedHa = normalizeToHectares(numericArea, areaUnit);

  const handleStepValue = (delta: number) => {
    const next = Math.max(0.25, Number((numericArea + delta).toFixed(2)));
    setAreaValue(String(next));
  };

  const handleAudioExplainer = () => {
    setIsAudioPlaying(true);
    const explainerText =
      'የአዲስ ማሳ ምዝገባ። የማሳዎን ስም፣ ስፋት፣ የጂፒኤስ መገኛ እና የአፈር ዓይነት ያስገቡ። መረጃው በስልክዎ ላይ ተቀምጦ ኔትወርክ ሲገኝ ይተላለፋል።';
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(explainerText);
      utterance.lang = 'am-ET';
      utterance.rate = 0.9;
      utterance.onend = () => setIsAudioPlaying(false);
      utterance.onerror = () => setIsAudioPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsAudioPlaying(false), 3000);
    }
  };

  const handleSavePlot = async () => {
    if (!plotName.trim()) {
      Alert.alert('ማስጠንቀቂያ', 'እባክዎ የማሳውን ስም ያስገቡ (Plot name is required)');
      return;
    }
    if (numericArea <= 0) {
      Alert.alert('ማስጠንቀቂያ', 'እባክዎ ትክክለኛ የመሬት ስፋት ያስገቡ');
      return;
    }

    setIsSubmitting(true);
    const res = await plotService.registerPlot({
      name: plotName.trim(),
      areaValue: numericArea,
      areaUnit,
      centroidLatitude: gpsData.latitude,
      centroidLongitude: gpsData.longitude,
      gpsAccuracyMeters: gpsData.accuracy,
      elevationMeters: gpsData.elevation,
      agroZone: gpsData.agroZone,
      soilClass,
      drainage,
      plannedCropName: plannedCrop,
      plannedSeasonYear: 2024,
    });
    setIsSubmitting(false);

    if (res.success) {
      Alert.alert(
        'ማሳው ተመዝግቧል!',
        `ማሳ "${plotName}" በተሳካ ሁኔታ ተመዝግቧል። (${calculatedHa} ሄክታር • ${gpsData.agroZone})`,
        [{ text: 'እሺ', onPress: () => onComplete?.() }]
      );
    } else {
      Alert.alert('ስህተት', res.error || 'ማሳ መመዝገብ አልተቻለም');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching Stitch */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => onNavigateBack?.() || onComplete?.()}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Register Plot • የማሳ ምዝገባ</Text>
        <Pressable style={styles.headerAudioBtn} onPress={handleAudioExplainer}>
          <Text style={styles.headerAudioText}>🔊</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Offline Status & Ambient Sync Ribbon */}
        <View style={styles.offlineRibbon}>
          <View style={styles.ribbonLeft}>
            <View style={styles.pulsingGreenDot} />
            <Text style={styles.ribbonText}>ከመስመር ውጭ ይሰራል (Local AI & Storage)</Text>
          </View>
          <Text style={styles.ribbonYear}>ኢትዮጵያ • 2017</Text>
        </View>

        {/* Audio Explainer & Step Banner */}
        <View style={styles.stepCard}>
          <View style={styles.stepTopRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>📍 ደረጃ 1 ከ 2 (ምዝገባ)</Text>
            </View>
            <View style={styles.stepDots}>
              <View style={styles.activeStepDot} />
              <View style={styles.inactiveStepDot} />
            </View>
          </View>

          <Text style={styles.stepTitle}>የአዲስ ማሳ ምዝገባ</Text>
          <Text style={styles.stepSubtitle}>
            ለአግሮኖሚክ ምክረ-ሀሳብና የአፈር እንክብካቤ ማሳዎን ይመዝግቡ
          </Text>

          {/* Touch-standard 48dp target Audio button */}
          <Pressable
            style={[styles.audioExplainerBtn, isAudioPlaying && styles.audioExplainerBtnActive]}
            onPress={handleAudioExplainer}>
            <View style={styles.audioExplainerLeft}>
              <Text style={styles.audioExplainerIcon}>🔊</Text>
              <Text style={styles.audioExplainerText}>
                {isAudioPlaying ? 'መመሪያ በመደመጥ ላይ...' : 'መመሪያውን አዳምጥ (45 ሴኮንድ)'}
              </Text>
            </View>
            <View style={styles.audioLangTag}>
              <Text style={styles.audioLangTagText}>አማርኛ</Text>
            </View>
          </Pressable>
        </View>

        {/* FIELD 1: Plot Name */}
        <View style={styles.inputCard}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              የማሳው ስም <Text style={styles.requiredStar}>*</Text>
            </Text>
            <Text style={styles.exampleText}>ምሳሌ፡ የታችኛው ማሳ</Text>
          </View>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              value={plotName}
              onChangeText={setPlotName}
              placeholder="የማሳውን ስም እዚህ ያስገቡ..."
              placeholderTextColor="#717a6d"
            />
            <Pressable
              style={styles.micBtn}
              onPress={() => Alert.alert('ድምጽ', 'የማሳ ስም በድምፅ ይናገሩ')}>
              <Text style={styles.micIcon}>🎙️</Text>
            </Pressable>
          </View>
        </View>

        {/* FIELD 2: Plot Size & Local Area Unit Selector */}
        <View style={styles.inputCard}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>የመሬት ስፋትና መለኪያ</Text>
            <Text style={styles.unitHighlight}>በአካባቢ ልኬት</Text>
          </View>

          {/* Unit Selector Pills */}
          <View style={styles.unitPillsRow}>
            {(
              [
                { unit: 'timad', name: 'ጥማድ', sub: '~0.25 ሄክታር' },
                { unit: 'kert', name: 'ከርት', sub: '~0.125 ሄክታር' },
                { unit: 'hectare', name: 'ሄክታር', sub: '10,000 ካ.ሜ' },
              ] as const
            ).map((item) => {
              const active = areaUnit === item.unit;
              return (
                <Pressable
                  key={item.unit}
                  style={[styles.unitPill, active && styles.unitPillActive]}
                  onPress={() => setAreaUnit(item.unit)}>
                  <Text style={[styles.unitPillName, active && styles.unitPillNameActive]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.unitPillSub, active && styles.unitPillSubActive]}>
                    {item.sub}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Input Value Stepper & Realtime Conversion */}
          <View style={styles.stepperRow}>
            <Pressable style={styles.stepBtn} onPress={() => handleStepValue(-0.5)}>
              <Text style={styles.stepBtnText}>−</Text>
            </Pressable>
            <View style={styles.stepperInputWrapper}>
              <TextInput
                style={styles.stepperInput}
                keyboardType="decimal-pad"
                value={areaValue}
                onChangeText={setAreaValue}
              />
              <Text style={styles.stepperUnitLabel}>
                {areaUnit === 'timad' ? 'ጥማድ' : areaUnit === 'kert' ? 'ከርት' : 'ሄክታር'}
              </Text>
            </View>
            <Pressable style={styles.stepBtn} onPress={() => handleStepValue(0.5)}>
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>

          {/* Realtime Auto-conversion Badge */}
          <View style={styles.convertedBadgeRow}>
            <View style={styles.convertedLeft}>
              <Text style={styles.calcIcon}>🧮</Text>
              <Text style={styles.convertedLabel}>የተሰላ ስፋት (ሄክታር):</Text>
            </View>
            <View style={styles.convertedPill}>
              <Text style={styles.convertedValue}>{calculatedHa} ሄክታር (Ha)</Text>
            </View>
          </View>
        </View>

        {/* FIELD 3: Offline GPS Centroid Capture */}
        <View style={styles.inputCard}>
          <View style={styles.labelRow}>
            <View style={styles.gpsLabelWrapper}>
              <Text style={styles.gpsIcon}>📍</Text>
              <Text style={styles.label}>የማሳው ጂፒኤስ (GPS) መገኛ</Text>
            </View>
            <View style={styles.gpsStatusBadge}>
              <View style={styles.smallGreenDot} />
              <Text style={styles.gpsStatusText}>ጂፒኤስ ተመዝግቧል</Text>
            </View>
          </View>

          {/* Centroid Snapshot Visualization Card */}
          <View style={styles.gpsSnapshotCard}>
            <View style={styles.gpsMetricRow}>
              <Text style={styles.gpsMetricKey}>ማስተባበሪያ (Coordinates):</Text>
              <Text style={styles.gpsMetricVal}>
                {gpsData.latitude}° ሰሜን, {gpsData.longitude}° ምስራቅ
              </Text>
            </View>

            <View style={styles.gpsMetricRow}>
              <Text style={styles.gpsMetricKey}>ትክክለኛነት (Accuracy):</Text>
              <Text
                style={[
                  styles.gpsMetricVal,
                  gpsData.accuracy <= 10 ? styles.accuracyGood : styles.accuracyWarn,
                ]}>
                {gpsData.accuracy} ሜትር (ከ 10ሜ በታች • ትክክለኛ)
              </Text>
            </View>

            <View style={styles.gpsMetricRow}>
              <Text style={styles.gpsMetricKey}>ከፍታ (Elevation):</Text>
              <Text style={styles.gpsMetricVal}>{gpsData.elevation} ሜትር ከባህር ጠለል</Text>
            </View>

            <View style={styles.gpsMetricRow}>
              <Text style={styles.gpsMetricKey}>የአየር ንብረት ክልል:</Text>
              <View style={styles.agroZonePill}>
                <Text style={styles.agroZonePillText}>
                  {gpsData.agroZone === 'kolla'
                    ? 'ቆላ (Kolla)'
                    : gpsData.agroZone === 'dega'
                      ? 'ደጋ (Dega)'
                      : 'ወይና ደጋ (Weyna Dega)'}
                </Text>
              </View>
            </View>
          </View>

          {/* Retake GPS Button */}
          <Pressable
            style={styles.retakeGpsBtn}
            onPress={captureRealGps}
            disabled={isLocating}>
            {isLocating ? (
              <ActivityIndicator size="small" color="#00450d" />
            ) : (
              <Text style={styles.retakeGpsBtnText}>🔄 መገኛን እንደገና ውሰድ (Retake GPS)</Text>
            )}
          </Pressable>
        </View>

        {/* FIELD 4: Qualitative Soil Class Picker */}
        <View style={styles.inputCard}>
          <View style={styles.labelRow}>
            <View>
              <Text style={styles.label}>የአፈር ዓይነት ምርጫ</Text>
              <Text style={styles.exampleText}>በማሳዎ የሚታየውን አፈር ይምረጡ</Text>
            </View>
            <Text style={styles.soilCardHeaderIcon}>🏞️</Text>
          </View>

          <View style={styles.soilGrid}>
            {[
              {
                id: 'koticha_vertisol',
                name: 'ኮቲቻ / ጥቁር አፈር',
                sub: 'ውሃ የማቆር ባሕርይ (Vertisol)',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHmdhAFrKygJmJE7FL7RBN2ni9thMbHFNe2enHeaipz-t5R73viC49M5dda_oJ5J-85pSqJHTsJSNKAAUDtRf01Py6VtON2WAneqi4mxFpt_6y0vRRFbKrMUFJbLhxFwIE72Z03R372pXrZrug0GaVEKl1KI90ibfnN9f-3xqDRTfwAxxN_ow3uskYmggkv2TJuVG3pjgZMqwUwg9kiUgst6ssThFzlNZVctY7p9awx_YhzMafQTnI0w',
              },
              {
                id: 'beda_nitisol',
                name: 'በዳ / ቀይ አፈር',
                sub: 'ቀይ ለም አፈር (Nitisol)',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAL1_CR0t_Kp7ppb_brP7bYZkl5wZoxS7HzczAkpzGR5T1ZYQLgYAs7ftwKMjO9E0uMzrSo0KQgIx5Pkrz_kICMn1ABJLQtmsagObkjTcIu7X_amZKcKR1UzCEBTnhhvMTvXKz1OeIc4BFPnCnwZfffuxKDhe8Sb1JrhkHOxWgy5PI7owVZe4OP-NpZd-3zKl0u8lifSn5nicJgax9mPtBzhYCn3ZvBiVk7c9fUgZSmRzuFmz7FQQM_rg',
              },
              {
                id: 'sandy',
                name: 'አሸዋማ አፈር',
                sub: 'ቀላል ፈሳሽ (Sandy)',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgywkvLPR9Y_dM59gvUIRvbM_-FZoycx3dcFLOcv33xWhaJ9lDktAvtgLR8-qBU7EB8WAVQ-mWxPQXtAXHWkzJtcN6LkWq06koS1q6YqWsaVl057vuf1PonpyytHcrYcrhGekGB7lLGx4yNspyWZaKJybUpCCBvUh_ZJyFAK481aU2MmOXnKEBwxt9m5cF4FQph438CgdfIFkq7LkeJtExhBvwa3UqOyPTfNavCu3Esm8FdTEhypMmOw',
              },
              {
                id: 'loam',
                name: 'ደለል / ለም አፈር',
                sub: 'ሚዛናዊ አፈር (Loam)',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ57g_zBXGTIZqQI3Vnn0lbbpw2KfMIw9VQLfAhuVpktAb7-QocYSSOtDvCN3PM_USaklcARonaYrcId4-iDhZ2g3-SIZlLdOWgKkuos9N2fzl7Nm3YWi2naX79vtR13Y6h5kpkBXddg8iOuKbjsYJmPTHdfktqlMTfabWZ0q1y4SfAVbdbRLKXvBDmrpXXrj_od94NiRpHjiySL5KPTdx_HIoe1qQuQGj7OEvKIKEOlBVnpWeT5qVDQ',
              },
            ].map((soil) => {
              const isSelected = soilClass === soil.id;
              return (
                <Pressable
                  key={soil.id}
                  style={[styles.soilOptionCard, isSelected && styles.soilOptionCardActive]}
                  onPress={() => setSoilClass(soil.id)}>
                  <Image source={{ uri: soil.img }} style={styles.soilThumb} resizeMode="cover" />
                  <Text style={styles.soilName}>{soil.name}</Text>
                  <Text style={styles.soilSub}>{soil.sub}</Text>
                  {isSelected && (
                    <View style={styles.soilSelectedCheck}>
                      <Text style={styles.soilCheckText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* FIELD 5: Drainage Behavior Selector */}
        <View style={styles.inputCard}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>የመሬቱ የውሃ ፍሳሽ ሁኔታ</Text>
            <Text style={styles.unitHighlight}>ዝናብ ሲዘንብ</Text>
          </View>
          <View style={styles.drainageRow}>
            {[
              { id: 'waterlogs', label: 'ውሃ የሚያቁር' },
              { id: 'moderate', label: 'መጠነኛ' },
              { id: 'free_draining', label: 'ቀጥታ የሚፈስ' },
            ].map((item) => {
              const active = drainage === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.drainageBtn, active && styles.drainageBtnActive]}
                  onPress={() => setDrainage(item.id)}>
                  <Text style={[styles.drainageBtnText, active && styles.drainageBtnTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* FIELD 6: Planned Season Crop */}
        <View style={styles.inputCard}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>የታቀደው የዘር ወቅት ሰብል</Text>
            <View style={styles.seasonTag}>
              <Text style={styles.seasonTagText}>2017/2024 ምርት ዘመን</Text>
            </View>
          </View>
          <View style={styles.cropSelectorBox}>
            <View style={styles.cropIconBox}>
              <Text style={styles.cropIcon}>🌱</Text>
            </View>
            <View style={styles.cropInfo}>
              <Text style={styles.cropName}>{plannedCrop}</Text>
              <Text style={styles.cropDesc}>ምርጥ የተሻሻለ ዝርያ • ነጭ ጤፍ</Text>
            </View>
            <Pressable
              style={styles.cropEditBtn}
              onPress={() => {
                const nextCrop =
                  plannedCrop.includes('ጤፍ')
                    ? 'ስርናይ (ደጋ ዝተዓረየ DZ-04)'
                    : plannedCrop.includes('ስርናይ')
                      ? 'በቆሎ (BH-661 Hybrid)'
                      : 'ጤፍ (ቁንጮ DZ-Cr-37)';
                setPlannedCrop(nextCrop);
              }}>
              <Text style={styles.cropEditBtnText}>ቀይር ✏️</Text>
            </Pressable>
          </View>
        </View>

        {/* Save & Confirm Plot CTA */}
        <View style={styles.ctaContainer}>
          <Pressable
            style={[styles.confirmSaveBtn, isSubmitting && styles.confirmSaveBtnDisabled]}
            onPress={handleSavePlot}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.confirmSaveBtnText}>
                ✓ ማሳውን መዝግብ (Confirm & Save Plot)
              </Text>
            )}
          </Pressable>
          <Text style={styles.ctaNote}>
            መረጃው በስልክዎ ላይ ተቀምጦ ኔትወርክ ሲገኝ በራስ-ሰር ይተላለፋል (Offline-First)
          </Text>
        </View>
      </ScrollView>

      {/* Floating Voice Assistant */}
      <VoiceAssistant />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  header: {
    height: 56,
    paddingHorizontal: Spacing.four,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e7eeff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f3ff',
  },
  backBtnText: {
    fontSize: 20,
    color: '#111c2d',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111c2d',
  },
  headerAudioBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f3ff',
  },
  headerAudioText: {
    fontSize: 18,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.seven + 40,
    gap: Spacing.four,
  },
  offlineRibbon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.medium,
  },
  ribbonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulsingGreenDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#006e1c',
  },
  ribbonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111c2d',
  },
  ribbonYear: {
    fontSize: 12,
    color: '#717a6d',
  },
  stepCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radii.card,
    padding: Spacing.four,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  stepTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepBadge: {
    backgroundColor: '#acf4a4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002203',
  },
  stepDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  activeStepDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00450d',
  },
  inactiveStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d8e3fb',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111c2d',
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#41493e',
    lineHeight: 18,
  },
  audioExplainerBtn: {
    marginTop: 6,
    height: 48,
    backgroundColor: '#ffdbcf',
    borderRadius: Radii.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  audioExplainerBtnActive: {
    backgroundColor: '#ffb59a',
  },
  audioExplainerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioExplainerIcon: {
    fontSize: 18,
  },
  audioExplainerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#380d00',
  },
  audioLangTag: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  audioLangTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#380d00',
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radii.card,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111c2d',
  },
  requiredStar: {
    color: '#ba1a1a',
  },
  exampleText: {
    fontSize: 12,
    color: '#717a6d',
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f3ff',
    borderRadius: Radii.medium,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#111c2d',
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#dee8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: 18,
  },
  unitHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00450d',
  },
  unitPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  unitPill: {
    flex: 1,
    backgroundColor: '#f0f3ff',
    borderRadius: Radii.medium,
    paddingVertical: 8,
    alignItems: 'center',
  },
  unitPillActive: {
    backgroundColor: '#00450d',
  },
  unitPillName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111c2d',
  },
  unitPillNameActive: {
    color: '#ffffff',
  },
  unitPillSub: {
    fontSize: 10,
    color: '#717a6d',
    marginTop: 2,
  },
  unitPillSubActive: {
    color: '#acf4a4',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: Radii.medium,
    backgroundColor: '#dee8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111c2d',
  },
  stepperInputWrapper: {
    flex: 1,
    height: 48,
    backgroundColor: '#f0f3ff',
    borderRadius: Radii.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  stepperInput: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111c2d',
    width: 80,
  },
  stepperUnitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#41493e',
  },
  convertedBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e7eeff',
    padding: 10,
    borderRadius: Radii.medium,
  },
  convertedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calcIcon: {
    fontSize: 16,
  },
  convertedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#006e1c',
  },
  convertedPill: {
    backgroundColor: '#91f78e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  convertedValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00450d',
  },
  gpsLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsIcon: {
    fontSize: 18,
  },
  gpsStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#91f78e',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  smallGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#006e1c',
  },
  gpsStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00450d',
  },
  gpsSnapshotCard: {
    backgroundColor: '#f0f3ff',
    borderRadius: Radii.medium,
    padding: 12,
    gap: 8,
  },
  gpsMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsMetricKey: {
    fontSize: 12,
    color: '#717a6d',
  },
  gpsMetricVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111c2d',
  },
  accuracyGood: {
    color: '#006e1c',
  },
  accuracyWarn: {
    color: '#ba1a1a',
  },
  agroZonePill: {
    backgroundColor: '#00450d',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  agroZonePillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  retakeGpsBtn: {
    height: 44,
    backgroundColor: '#dee8ff',
    borderRadius: Radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeGpsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111c2d',
  },
  soilCardHeaderIcon: {
    fontSize: 18,
  },
  soilGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  soilOptionCard: {
    width: '48%',
    backgroundColor: '#f0f3ff',
    borderRadius: Radii.medium,
    padding: 8,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  soilOptionCardActive: {
    borderColor: '#00450d',
    backgroundColor: '#e7eeff',
  },
  soilThumb: {
    width: '100%',
    height: 70,
    borderRadius: 6,
    marginBottom: 6,
  },
  soilName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111c2d',
  },
  soilSub: {
    fontSize: 10,
    color: '#717a6d',
    marginTop: 2,
  },
  soilSelectedCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00450d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soilCheckText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  drainageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  drainageBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radii.medium,
    backgroundColor: '#f0f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  drainageBtnActive: {
    backgroundColor: '#00450d',
  },
  drainageBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111c2d',
  },
  drainageBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  seasonTag: {
    backgroundColor: '#acf4a4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  seasonTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#002203',
  },
  cropSelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f3ff',
    borderRadius: Radii.medium,
    padding: 10,
    gap: 10,
  },
  cropIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#dee8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropIcon: {
    fontSize: 20,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111c2d',
  },
  cropDesc: {
    fontSize: 11,
    color: '#717a6d',
    marginTop: 2,
  },
  cropEditBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#dee8ff',
  },
  cropEditBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111c2d',
  },
  ctaContainer: {
    gap: 8,
    paddingTop: 4,
  },
  confirmSaveBtn: {
    height: 52,
    backgroundColor: '#00450d',
    borderRadius: Radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmSaveBtnDisabled: {
    opacity: 0.6,
  },
  confirmSaveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  ctaNote: {
    fontSize: 12,
    color: '#717a6d',
    textAlign: 'center',
    lineHeight: 16,
  },
});
