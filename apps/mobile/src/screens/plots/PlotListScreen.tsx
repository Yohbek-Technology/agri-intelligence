import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii } from '@/theme/tokens';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';
import { plotService, Plot } from '@/services/api/plot-service';
import { normalizeToHectares, formatFromHectares, AreaUnit } from '@/utils/unit-converter';

export interface PlotListScreenProps {
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export function PlotListScreen({ onNavigate }: PlotListScreenProps) {
  const [selectedUnit, setSelectedUnit] = useState<AreaUnit>('timad');
  const [plots, setPlots] = useState<Plot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState<string | null>(null);

  useEffect(() => {
    loadPlots();
  }, []);

  async function loadPlots() {
    setIsLoading(true);
    const res = await plotService.fetchPlots();
    if (res.success && res.data) {
      setPlots(res.data);
    }
    setIsLoading(false);
  }

  // Calculate aggregated farm stats in chosen unit
  const aggregatedStats = useMemo(() => {
    let totalHa = 0;
    plots.forEach((p) => {
      const numericVal = typeof p.areaValue === 'string' ? parseFloat(p.areaValue) : p.areaValue;
      const ha = p.areaHectares
        ? (typeof p.areaHectares === 'string' ? parseFloat(p.areaHectares) : p.areaHectares)
        : normalizeToHectares(numericVal || 0, p.areaUnit);
      totalHa += ha;
    });

    const displayValue = formatFromHectares(totalHa, selectedUnit);
    return {
      totalHa: Number(totalHa.toFixed(2)),
      displayValue,
      count: plots.length,
    };
  }, [plots, selectedUnit]);

  // Audio playback handler using Web SpeechSynthesis or tactile feedback
  const handlePlayAudio = (target: string, text: string) => {
    setIsAudioPlaying(target);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'am-ET';
      utterance.rate = 0.9;
      utterance.onend = () => setIsAudioPlaying(null);
      utterance.onerror = () => setIsAudioPlaying(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsAudioPlaying(null), 2500);
    }
  };

  const getUnitLabel = (unit: AreaUnit) => {
    switch (unit) {
      case 'timad':
        return 'ጥማድ (Timad)';
      case 'kert':
        return 'ከርት (Kert)';
      case 'hectare':
        return 'ሄክታር (Ha)';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header matching Stitch Layout */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerPills}>
            <View style={styles.syncPill}>
              <View style={styles.greenDot} />
              <Text style={styles.syncPillText}>Synced • 0 pending</Text>
            </View>
            <View style={styles.locationPill}>
              <Text style={styles.locationText}>📍 Adama • Kebele 03</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeText}>AM / አማ</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerBottomRow}>
          <Text style={styles.title}>Plots • ዝርዝር መሬታት</Text>
          <Pressable
            style={[styles.listenBtn, isAudioPlaying === 'header' && styles.listenBtnActive]}
            onPress={() =>
              handlePlayAudio(
                'header',
                `ጠቕላላ ${plots.length} ዝተመዝገቡ መሬታት ኣለዉኹም። ድምር ስፍሓት ${aggregatedStats.displayValue} ${selectedUnit} እዩ።`
              )
            }>
            <Text style={styles.listenBtnText}>
              {isAudioPlaying === 'header' ? '🔊 በመጫወት ላይ...' : '🔊 አዳምጥ'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Land Measurement Unit Segmented Controller */}
        <View style={styles.segmentedController}>
          {(['timad', 'kert', 'hectare'] as AreaUnit[]).map((unit) => {
            const isSelected = selectedUnit === unit;
            return (
              <Pressable
                key={unit}
                style={[styles.segmentBtn, isSelected && styles.segmentBtnActive]}
                onPress={() => setSelectedUnit(unit)}>
                <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
                  {getUnitLabel(unit)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Aggregated Farm Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryBadge}>📊 ጠቕላላ ድምር ስፍሓት (FARM TOTAL)</Text>
              <View style={styles.summaryMetricRow}>
                <Text style={styles.summaryMetricValue}>{aggregatedStats.displayValue}</Text>
                <Text style={styles.summaryMetricUnit}>{selectedUnit}</Text>
                <Text style={styles.summaryMetricSub}>≈ {aggregatedStats.totalHa} ሄክታር</Text>
              </View>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{aggregatedStats.count} ዝተመዝገቡ መሬታት</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryFooter}>
            <View style={styles.seasonRow}>
              <View style={styles.pulsingDot} />
              <Text style={styles.seasonText}>እዋን ሕርሻ: መኸር (Meher 2024/2017)</Text>
            </View>
            <Pressable
              style={styles.summaryAudioBtn}
              onPress={() =>
                handlePlayAudio(
                  'summary',
                  `ጠቕላላ ድምር ስፍሓት ${aggregatedStats.displayValue} ${selectedUnit} እዩ። እዋን ሕርሻ መኸር።`
                )
              }>
              <Text style={styles.summaryAudioBtnText}>🔊 ኩነታት ስማዕ</Text>
            </Pressable>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>መሬት መረጃ በመጫን ላይ...</Text>
          </View>
        ) : (
          plots.map((plot, index) => {
            const numericVal =
              typeof plot.areaValue === 'string' ? parseFloat(plot.areaValue) : plot.areaValue;
            const ha = plot.areaHectares
              ? typeof plot.areaHectares === 'string'
                ? parseFloat(plot.areaHectares)
                : plot.areaHectares
              : normalizeToHectares(numericVal || 0, plot.areaUnit);
            const convertedDisplay = formatFromHectares(ha, selectedUnit);

            const isPlot1 = index === 0;
            const photoUrl = isPlot1
              ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOPO_sGMOP6ap6pjbhaz8ca7LLBFrMjTxRXSgZkd9xTxn6vfbcKXxzETb5oq42Gxnu81B3Y0dhuAKPixzhEyMi2inSMpE6v4Kk3rzTeHVBqrI_z1f-d2BLDcIY7wL0aUWP5gY525iEI3AIHYI3ROOQOrpVp0D79Sy8V8eYBgpAVmia5j4SyHGsQSDGKcW5VhFAIzbCGphMeoi6gDDvj9of4UllevMdqyJPpHgRU2HWxS_EdbuEFhpBSg'
              : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJVXZgMi0nmcZwPNmPMkIR0BSn31sSOuzPSs6vMhHVhn2nEqJ1kUFSethX3RyEOXULaN3XWuESx2--by14XfDTA4776dl9bv928t4Yw0Y5UGUXUv6G4mRq0saOuW_v_rtVQjeSvAEMm0t92J_IOupP5Ef7CoRwyx3TbPvPM6CYf4Of4q4O4KJt5mixQXbngBYGvCE5nNq_tBTekwtjuKwOLW06WgZFp5B3D0PYotJk_ZNA9IqU-D_DbA';

            const cropName = plot.activeCycle?.cropName || (isPlot1 ? 'ስርናይ (ደጋ ዝተዓረየ)' : 'ጤፍ (ማግና - Magna)');
            const daysProgress = isPlot1 ? '42 / 90 መዓልቲ (46%)' : '65 / 110 መዓልቲ (59%)';
            const progressPct = isPlot1 ? 46 : 59;
            const soilLabel =
              plot.soilClass === 'beda_nitisol'
                ? 'በዳ / ቀይሕ ሓመድ (Red Nitisol) • ጥዑይ ፍሳሽ'
                : 'ኮቲቻ (Koticha Black Vertisol) • ማይ ዝዕቁር';
            const zoneLabel = `${plot.agroZone === 'kolla' ? 'ቆላ' : plot.agroZone === 'dega' ? 'ደጋ' : 'ወይና ደጋ'} (${plot.elevationMeters || 1710} ሜትር)`;

            return (
              <View key={plot.id} style={styles.plotCard}>
                {/* Visual Banner Header */}
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photoUrl }} style={styles.plotPhoto} resizeMode="cover" />
                  <View style={styles.photoOverlay} />
                  <View style={styles.photoTopRow}>
                    <View style={styles.cropBadge}>
                      <Text style={styles.cropBadgeText}>🌱 {cropName}</Text>
                    </View>
                    <Pressable
                      style={styles.cardListenBtn}
                      onPress={() =>
                        handlePlayAudio(
                          plot.id,
                          `${plot.name}፡ ${convertedDisplay} ${selectedUnit}። ሰብል ${cropName}። ${soilLabel}`
                        )
                      }>
                      <Text style={styles.cardListenBtnText}>
                        {isAudioPlaying === plot.id ? '🔊' : '🔊 ድምፂ ስማዕ'}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.photoBottomBadge}>
                    <Text style={styles.plotNumberText}>መሬት ቑፅሪ {index + 1}</Text>
                  </View>
                </View>

                {/* Plot Specs */}
                <View style={styles.plotBody}>
                  <View style={styles.plotTitleRow}>
                    <Text style={styles.plotTitle}>{plot.name}</Text>
                    <Text style={styles.plotArea}>
                      {convertedDisplay} {selectedUnit}{' '}
                      <Text style={styles.plotAreaSub}>({ha} ሄክታር)</Text>
                    </Text>
                  </View>

                  <View style={styles.tagRow}>
                    <View style={styles.specTag}>
                      <Text style={styles.specTagText}>🏞️ {soilLabel}</Text>
                    </View>
                    <View style={styles.specTag}>
                      <Text style={styles.specTagText}>⛰️ {zoneLabel}</Text>
                    </View>
                  </View>

                  {/* Growth Progress Bar */}
                  <View style={styles.growthContainer}>
                    <View style={styles.growthHeader}>
                      <Text style={styles.growthStage}>
                        🌿 {plot.activeCycle?.stage || (isPlot1 ? 'እዋን ምዕባለ (Vegetative)' : 'ዕምበባ እዋን (Flowering)')}
                      </Text>
                      <Text style={styles.growthDays}>{daysProgress}</Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                    </View>
                  </View>

                  {/* Urgent Next Action Pill */}
                  {isPlot1 && (
                    <View style={styles.urgentPill}>
                      <View style={styles.urgentIconCircle}>
                        <Text style={styles.urgentIcon}>⏰</Text>
                      </View>
                      <View style={styles.urgentTextContainer}>
                        <Text style={styles.urgentTitle}>ቀፃሊ ስራሕ: 2ይ ዩሪያ ምስማር</Text>
                        <Text style={styles.urgentSubtitle}>ኣብ ውሽጢ 3 መዓልቲ ይተግብሩ</Text>
                      </View>
                      <Text style={styles.urgentPriority}>⚠️</Text>
                    </View>
                  )}

                  {/* Card Action Buttons */}
                  <View style={styles.cardActionsRow}>
                    <Pressable
                      style={styles.logOperationBtn}
                      onPress={() => onNavigate?.('UniversalLogger', { plotId: plot.id })}>
                      <Text style={styles.logOperationBtnText}>📝 ምዝገባ ሓበሬታ</Text>
                    </Pressable>
                    <Pressable
                      style={styles.viewDetailBtn}
                      onPress={() => onNavigate?.('PlotDetail', { plotId: plot.id })}>
                      <Text style={styles.viewDetailBtnText}>ዝርዝር ርአ ➔</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Register New Plot Card */}
        <Pressable
          style={styles.registerNewCard}
          onPress={() => onNavigate?.('RegisterPlot')}>
          <View style={styles.addIconCircle}>
            <Text style={styles.addIconText}>📍</Text>
          </View>
          <Text style={styles.registerTitle}>+ ሓዱሽ መሬት መዝግብ (Add New Plot)</Text>
          <Text style={styles.registerSubtitle}>
            ብጂፒኤስ (GPS) ወይ ብስፍሓት ጥማድ መዝግብ • Offline Ready
          </Text>
          <View style={styles.voicePromptPill}>
            <Text style={styles.voicePromptText}>🎙️ ሓገዝ ብድምፂ ሕተት</Text>
          </View>
        </Pressable>

        {/* Agronomic Advisory Micro-Toast */}
        <View style={styles.advisoryToast}>
          <Text style={styles.advisoryIcon}>💡</Text>
          <Text style={styles.advisoryText}>
            ኣብ ከባቢኹም ዝመፅእ ዘሎ ዝናብ ንስርናይኹም ፅቡቕ እዩ። መሬትኩም ካብ ምዕልቕላቕ ማይ ምክልኻል ኣይትረስዑ።
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e7eeff',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  headerPills: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#e7eeff',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#006e1c',
  },
  syncPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00450d',
  },
  locationPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#f0f3ff',
  },
  locationText: {
    fontSize: 12,
    color: '#41493e',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  langBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#e7eeff',
  },
  langBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111c2d',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00450d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
  },
  headerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111c2d',
  },
  listenBtn: {
    backgroundColor: '#e7eeff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  listenBtnActive: {
    backgroundColor: '#90d689',
  },
  listenBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00450d',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.seven + 40,
    gap: Spacing.four,
  },
  segmentedController: {
    flexDirection: 'row',
    backgroundColor: '#e7eeff',
    borderRadius: Radii.card,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.medium,
  },
  segmentBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#41493e',
  },
  segmentTextActive: {
    color: '#00450d',
    fontWeight: '800',
  },
  summaryCard: {
    backgroundColor: '#00450d',
    borderRadius: Radii.card,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#acf4a4',
    letterSpacing: 0.5,
  },
  summaryMetricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  summaryMetricValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
  },
  summaryMetricUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#acf4a4',
  },
  summaryMetricSub: {
    fontSize: 14,
    color: '#91d78a',
  },
  countBadge: {
    backgroundColor: '#1b5e20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  countBadgeText: {
    color: '#acf4a4',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: Spacing.three,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulsingDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#94f990',
  },
  seasonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  summaryAudioBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  summaryAudioBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00450d',
  },
  loadingContainer: {
    padding: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    fontSize: 14,
    color: '#41493e',
  },
  plotCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radii.card,
    overflow: 'hidden',
    borderLeftWidth: 5,
    borderLeftColor: '#00450d',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  photoContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#dee8ff',
  },
  plotPhoto: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  photoTopRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropBadge: {
    backgroundColor: 'rgba(0, 69, 13, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  cropBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cardListenBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  cardListenBtnText: {
    color: '#6c2200',
    fontSize: 12,
    fontWeight: '800',
  },
  photoBottomBadge: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  plotNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111c2d',
  },
  plotBody: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  plotTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  plotTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111c2d',
    flex: 1,
  },
  plotArea: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00450d',
  },
  plotAreaSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#41493e',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specTag: {
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  specTagText: {
    fontSize: 12,
    color: '#41493e',
    fontWeight: '500',
  },
  growthContainer: {
    backgroundColor: '#f0f3ff',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  growthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  growthStage: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00450d',
  },
  growthDays: {
    fontSize: 12,
    color: '#41493e',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#d8e3fb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#006e1c',
    borderRadius: 4,
  },
  urgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdbcf',
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  urgentIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6c2200',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentIcon: {
    fontSize: 14,
  },
  urgentTextContainer: {
    flex: 1,
  },
  urgentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#380d00',
  },
  urgentSubtitle: {
    fontSize: 11,
    color: '#802a00',
  },
  urgentPriority: {
    fontSize: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  logOperationBtn: {
    flex: 1,
    backgroundColor: '#f0f3ff',
    paddingVertical: 12,
    borderRadius: Radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logOperationBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111c2d',
  },
  viewDetailBtn: {
    flex: 1,
    backgroundColor: '#00450d',
    paddingVertical: 12,
    borderRadius: Radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  registerNewCard: {
    backgroundColor: '#f0f3ff',
    borderWidth: 1.5,
    borderColor: '#90d689',
    borderStyle: 'dashed',
    borderRadius: Radii.card,
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#acf4a4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconText: {
    fontSize: 26,
  },
  registerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#00450d',
    textAlign: 'center',
  },
  registerSubtitle: {
    fontSize: 13,
    color: '#41493e',
    textAlign: 'center',
  },
  voicePromptPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  voicePromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6c2200',
  },
  advisoryToast: {
    flexDirection: 'row',
    backgroundColor: '#dee8ff',
    padding: Spacing.three,
    borderRadius: Radii.medium,
    alignItems: 'center',
    gap: 10,
  },
  advisoryIcon: {
    fontSize: 22,
  },
  advisoryText: {
    flex: 1,
    fontSize: 13,
    color: '#111c2d',
    lineHeight: 18,
  },
});
