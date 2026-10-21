import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';
import { plotService, Plot } from '@/services/api/plot-service';

export interface PlotDetailScreenProps {
  plotId?: string;
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
  onNavigateBack?: () => void;
}

export function PlotDetailScreen({
  plotId = 'plot-default-1',
  onNavigate,
  onNavigateBack,
}: PlotDetailScreenProps) {
  const [plot, setPlot] = useState<Plot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    loadPlot();
  }, [plotId]);

  async function loadPlot() {
    setIsLoading(true);
    const res = await plotService.fetchPlotDetail(plotId);
    if (res.success && res.data) {
      setPlot(res.data);
    }
    setIsLoading(false);
  }

  const handleAudioReadAloud = () => {
    setIsAudioPlaying(true);
    const text = plot
      ? `${plot.name}። ስፋት ${plot.areaValue} ${plot.areaUnit}። ከፍታ ${plot.elevationMeters} ሜትር። የአፈር ዓይነት ${plot.soilClass}። ወቅታዊ ሰብል ጤፍ ወይም ስርናይ።`
      : 'የማሳ ዝርዝር መረጃ።';

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'am-ET';
      utterance.rate = 0.9;
      utterance.onend = () => setIsAudioPlaying(false);
      utterance.onerror = () => setIsAudioPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsAudioPlaying(false), 2500);
    }
  };

  const handleArchive = async () => {
    Alert.alert(
      'ማሳውን ማህደር አድርግ (Archive Plot)',
      'ይህንን ማሳ ማህደር ማድረግ ይፈልጋሉ? በኋላ መልሰው ማንቃት ይችላሉ።',
      [
        { text: 'ይቅር', style: 'cancel' },
        {
          text: 'አዎ ማህደር አድርግ',
          style: 'destructive',
          onPress: async () => {
            setIsArchiving(true);
            const res = await plotService.archivePlot(plotId);
            setIsArchiving(false);
            if (res.success) {
              Alert.alert('ማህደር ተደርጓል', 'ማሳው በማህደር ተቀምጧል', [
                { text: 'እሺ', onPress: () => onNavigateBack?.() },
              ]);
            } else {
              Alert.alert('ስህተት', res.error || 'ማህደር ማድረግ አልተቻለም');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00450d" />
          <Text style={styles.loadingText}>የማሳ ዝርዝር በመጫን ላይ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activePlot = plot || {
    id: plotId,
    name: 'Lower Field (ታችኛው ማሳ)',
    areaValue: 2.0,
    areaUnit: 'timad' as const,
    areaHectares: 0.5,
    elevationMeters: 1710,
    agroZone: 'weyna_dega' as const,
    soilClass: 'koticha_vertisol',
    drainage: 'waterlogs',
    status: 'active' as const,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => onNavigateBack?.()}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Plot Details • ዝርዝር መሬት</Text>
        <Pressable style={styles.headerAudioBtn} onPress={handleAudioReadAloud}>
          <Text style={styles.headerAudioText}>🔊</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Offline & Sync Status Ribbon */}
        <View style={styles.syncRibbon}>
          <View style={styles.syncLeft}>
            <View style={styles.greenDot} />
            <Text style={styles.syncText}>Offline Mode (Storage Ready)</Text>
          </View>
          <Text style={styles.syncTime}>🔄 Synced 12m ago</Text>
        </View>

        {/* Hero Status & Audio Trigger */}
        <View style={styles.heroRow}>
          <View style={styles.cycleBadge}>
            <Text style={styles.cycleBadgeText}>🌱 Active Cycle: Teff 2024</Text>
          </View>
          <Pressable
            style={[styles.audioTtsBtn, isAudioPlaying && styles.audioTtsBtnActive]}
            onPress={handleAudioReadAloud}>
            <Text style={styles.audioTtsIcon}>🔊</Text>
            <Text style={styles.audioTtsText}>
              {isAudioPlaying ? 'በማዳመጥ ላይ...' : 'Listen • አዳምጥ'}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.heroDescription}>
          Autonomous telemetry & agronomic history for Lower Field parcel #04-ET.
        </Text>

        {/* Plot Profile Card (Bento Layout) */}
        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.landscapeIconBox}>
                <Text style={styles.landscapeIcon}>🏞️</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>{activePlot.name}</Text>
                <Text style={styles.cardCadastral}>Cadastral ID: PLOT-882-DR</Text>
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          </View>

          {/* Verified by DA Sisay Banner */}
          <View style={styles.daEndorsementBanner}>
            <Text style={styles.daIcon}>👨‍🌾</Text>
            <Text style={styles.daText}>
              Verified on-site by <Text style={styles.daBold}>DA Sisay Kebede</Text> (Field GPS locked)
            </Text>
          </View>

          {/* Bento Attributes Grid */}
          <View style={styles.bentoGrid}>
            <View style={styles.bentoCell}>
              <Text style={styles.bentoLabel}>Total Area</Text>
              <Text style={styles.bentoBigValue}>
                {activePlot.areaValue} {activePlot.areaUnit}
              </Text>
              <Text style={styles.bentoSub}>{activePlot.areaHectares || 0.5} Ha Equivalent</Text>
            </View>

            <View style={styles.bentoCell}>
              <Text style={styles.bentoLabel}>Agro-Climatic Zone</Text>
              <Text style={styles.bentoBigValue}>
                {activePlot.agroZone === 'kolla'
                  ? 'Kolla'
                  : activePlot.agroZone === 'dega'
                    ? 'Dega'
                    : 'Weyna Dega'}
              </Text>
              <Text style={styles.bentoSub}>Mid-Altitude ({activePlot.elevationMeters}m)</Text>
            </View>

            <View style={[styles.bentoCell, styles.bentoCellSpan2]}>
              <Text style={styles.bentoLabel}>Soil & Water Dynamics</Text>
              <Text style={styles.bentoSoilTitle}>
                {activePlot.soilClass === 'beda_nitisol'
                  ? 'Beda (Red Nitisol) • Good Drainage'
                  : 'Koticha (Heavy Black Vertisol)'}
              </Text>
              <Text style={styles.bentoSoilDesc}>
                High clay retention • High waterlogging risk during peak Meher rains
              </Text>
            </View>
          </View>

          {/* Geo-Centroid Preview */}
          <View style={styles.geoMapBox}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvpHGAEQkxhjvOxhHa3iBQj2c2NKyQvlHKGUCmeMfbz_C3KjAX4cYOc_gQVzHHaTZ7zYkoBsDjXJIwG-21Lf02yz7Op8cVFIWjBo6n3srH8uAiwsjf22lr1f4_wPXGAuwAK96966NRm8jO_UoHixFMahMre33fOHgGv8n5bfv_zn2g-7CCV2EvpBMYNubOgIolJJoTRiUcTG84XE6FTDLiGJTfprdONg0E84x47PgWS9WTdwDrP8qNDA',
              }}
              style={styles.geoMapImg}
              resizeMode="cover"
            />
            <View style={styles.geoOverlay}>
              <Text style={styles.geoCoordsText}>
                📍 8.5411° N, 39.2704° E • 1,710m ASL (Kebele 03)
              </Text>
            </View>
          </View>
        </View>

        {/* Active Crop Cycle Milestones Tracker (SRS CROP-3) */}
        <View style={styles.milestonesCard}>
          <View style={styles.milestonesHeader}>
            <View>
              <Text style={styles.milestonesTitle}>2024 Teff Milestones</Text>
              <Text style={styles.milestonesSubtitle}>DZ-Cr-37 (Quncho) • Day 38 After Sowing</Text>
            </View>
            <View style={styles.progressPercentPill}>
              <Text style={styles.progressPercentText}>57% Done</Text>
            </View>
          </View>

          {/* Timeline Steps */}
          <View style={styles.timeline}>
            {/* Step 1: Completed */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineNode, styles.timelineNodeDone]}>
                <Text style={styles.nodeCheck}>✓</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepTitleDone}>1. Land Preparation</Text>
                <Text style={styles.stepDesc}>4 maresha plow passes executed to break Koticha clods</Text>
              </View>
            </View>

            {/* Step 2: Completed */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineNode, styles.timelineNodeDone]}>
                <Text style={styles.nodeCheck}>✓</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepTitleDone}>2. Row Sowing (DZ-Cr-37)</Text>
                <Text style={styles.stepDesc}>Certified seed at 10kg/ha density</Text>
              </View>
            </View>

            {/* Step 3: Completed */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineNode, styles.timelineNodeDone]}>
                <Text style={styles.nodeCheck}>✓</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepTitleDone}>3. Basal NPS Application</Text>
                <Text style={styles.stepDesc}>50 kg blended NPS incorporated during sowing</Text>
              </View>
            </View>

            {/* Step 4: Active */}
            <View style={[styles.timelineStep, styles.timelineStepActive]}>
              <View style={[styles.timelineNode, styles.timelineNodeActive]}>
                <Text style={styles.nodePulse}>●</Text>
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.activeStepTitleRow}>
                  <Text style={styles.stepTitleActive}>4. Vegetative & 1st Urea</Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                </View>
                <Text style={styles.stepDescActive}>
                  Completed Day 38. Vigor high, weed pressure addressed.
                </Text>
              </View>
            </View>

            {/* Step 5: Pending */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineNode, styles.timelineNodePending]}>
                <Text style={styles.nodePendingIcon}>⏳</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepTitlePending}>5. 2nd Urea Top-Dress (Pending)</Text>
                <Text style={styles.stepDesc}>Target window: DAS 45-50 (Rainfall moisture alignment)</Text>
              </View>
            </View>

            {/* Step 6: Upcoming */}
            <View style={[styles.timelineStep, styles.timelineStepDimmed]}>
              <View style={[styles.timelineNode, styles.timelineNodePending]}>
                <Text style={styles.nodePendingIcon}>⌛</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepTitlePending}>6. Flowering & Grain Filling</Text>
                <Text style={styles.stepDesc}>Expected early October with head emergence</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Multi-Season Crop History (SRS CROP-1 & CROP-2) */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <View style={styles.historyHeaderLeft}>
              <Text style={styles.historyIcon}>📜</Text>
              <Text style={styles.historyTitle}>Rotation History</Text>
            </View>
            <Pressable
              style={styles.addRecordBtn}
              onPress={() => Alert.alert('መዝገብ', 'የቀድሞ ዓመት ሰብል ታሪክ ይጨምሩ')}>
              <Text style={styles.addRecordBtnText}>+ Add Record</Text>
            </Pressable>
          </View>

          {/* 2024 Current */}
          <View style={styles.historyRow}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzSBJtr_eY0dumeegXZFu46qBcRp3tFY8WqcvSGo-w9AW7dbSrsHr7WQcjjhwAR8J0uG73oBnMkLyT0rsznJNi7AKR6Zk35q9EXMO84IdKS7ZzSpbRom-cQJGphH9AApehdO0nlHK6tbo9qjmhszPiDUWYWHDajJOf2TQSf-bU1df_9RkgiPXI_7IAgXwvCLSIqavFP9uzE9Jlkj_BsgeEWV7nhODCerFCbyr8HzvxYtoJfbf8i9CZsA',
              }}
              style={styles.historyThumb}
              resizeMode="cover"
            />
            <View style={styles.historyInfo}>
              <View style={styles.historyTagRow}>
                <Text style={styles.historyYear}>2024 (Current)</Text>
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>Active</Text>
                </View>
              </View>
              <Text style={styles.historyCropName}>Teff (Quncho DZ-Cr-37)</Text>
              <Text style={styles.historyCropDetail}>Vegetative Stage • Day 38</Text>
            </View>
          </View>

          {/* 2023 Meher */}
          <View style={styles.historyRow}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI8F0jD2QcH6_DbRw45iXrja_wUnbi2PSsSiqHS1who29l53qqS7qAI-G0SkO3oJNrgHVRTqPme3H_sO4aWwGjbAQqbiQgCdTuQ0tQbv6tIzItnij039N3qqn9VuQ33PgXB578XOXL_tIe9FRDYpB2L2Cq8QSaJKJiI4wi-OskGDPEAegfZfVTQxDXnXzIOB6V0yotzAG3QVa7NQZmXx3dIE1oCBkt6Gvmt027Hqrh1n0Ro-gBy_bIPA',
              }}
              style={styles.historyThumb}
              resizeMode="cover"
            />
            <View style={styles.historyInfo}>
              <View style={styles.historyTagRow}>
                <Text style={styles.historyYear}>2023 (Meher)</Text>
                <View style={styles.closedTag}>
                  <Text style={styles.closedTagText}>Closed</Text>
                </View>
              </View>
              <Text style={styles.historyCropName}>Bread Wheat (Dega)</Text>
              <Text style={styles.historyCropDetail}>Yield: 24 Qt/Ha • Clean grain</Text>
            </View>
          </View>

          {/* 2022 Legume Rotation */}
          <View style={styles.historyRow}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_-CCGPMqMxV5k_K-z2otz2Z_rY5r1Okr3igcahkz43OZ28BHWh9LInonfobkGax-j9DU1SJwVVGuOnMfNiqkbCwP5Z6tN-tE2Bfp-Etw37zAQcrSUDrqS0zua5pjsrxbfTVd5xpWUugEX9Ke-DtPrPLhdVVFZyr_6JAVYg_sAKPF0zbqr0wN2sTCBEKYd_zwNcAI0fytpM28lh6wVR1VoDIpy78-L00bUeoyDuEOaed1L0ymwfQQ5eA',
              }}
              style={styles.historyThumb}
              resizeMode="cover"
            />
            <View style={styles.historyInfo}>
              <View style={styles.historyTagRow}>
                <Text style={styles.historyYear}>2022 (Meher)</Text>
                <View style={styles.nRestoreTag}>
                  <Text style={styles.nRestoreTagText}>N-Restoration</Text>
                </View>
              </View>
              <Text style={styles.historyCropName}>Chickpea / Haricot Bean</Text>
              <Text style={styles.historyCropDetail}>Soil Nitrogen restored • Rotation break</Text>
            </View>
          </View>
        </View>

        {/* Season Cash Ledger Summary (SRS CROP-11) */}
        <View style={styles.ledgerCard}>
          <View style={styles.ledgerHeader}>
            <View style={styles.ledgerHeaderLeft}>
              <Text style={styles.ledgerIcon}>💳</Text>
              <View>
                <Text style={styles.ledgerTitle}>Season Cash Ledger</Text>
                <Text style={styles.ledgerSubtitle}>2024 Teff Cycle Financial Estimate</Text>
              </View>
            </View>
            <Text style={styles.ledgerTrending}>📈</Text>
          </View>

          <View style={styles.ledgerMetricsRow}>
            <View style={styles.ledgerCell}>
              <Text style={styles.ledgerLabel}>Total Cost</Text>
              <Text style={styles.costValue}>6,450 ETB</Text>
              <Text style={styles.ledgerNote}>Seed+NPS+Labor</Text>
            </View>

            <View style={styles.ledgerCell}>
              <Text style={styles.ledgerLabel}>Exp. Revenue</Text>
              <Text style={styles.revenueValue}>18,500 ETB</Text>
              <Text style={styles.ledgerNote}>Teff @ Market</Text>
            </View>

            <View style={[styles.ledgerCell, styles.ledgerCellMargin]}>
              <Text style={styles.marginLabel}>Net Margin</Text>
              <Text style={styles.marginValue}>+12,050 ETB</Text>
              <Text style={styles.marginNote}>Projected</Text>
            </View>
          </View>
        </View>

        {/* Action Shortcuts */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.primaryActionBtn}
            onPress={() => onNavigate?.('UniversalLogger', { plotId })}>
            <Text style={styles.primaryActionBtnText}>📝 Log Field Operation</Text>
          </Pressable>

          <View style={styles.secondaryActionRow}>
            <Pressable
              style={styles.secondaryActionBtn}
              onPress={() => onNavigate?.('WeatherForecast', { plotId })}>
              <Text style={styles.secondaryActionBtnText}>🌦️ 7-Day Weather</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryActionBtn}
              onPress={() => onNavigate?.('Diagnostics', { plotId })}>
              <Text style={styles.secondaryActionBtnText}>🐛 Pest History</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.archiveBtn}
            onPress={handleArchive}
            disabled={isArchiving}>
            {isArchiving ? (
              <ActivityIndicator color="#ba1a1a" size="small" />
            ) : (
              <Text style={styles.archiveBtnText}>🗑️ Archive Plot (ማህደር አድርግ)</Text>
            )}
          </Pressable>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    fontSize: 14,
    color: '#41493e',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.seven + 40,
    gap: Spacing.four,
  },
  syncRibbon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e7eeff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.medium,
  },
  syncLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#006e1c',
  },
  syncText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111c2d',
  },
  syncTime: {
    fontSize: 12,
    color: '#41493e',
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cycleBadge: {
    backgroundColor: '#acf4a4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cycleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002203',
  },
  audioTtsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffdbcf',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  audioTtsBtnActive: {
    backgroundColor: '#ffb59a',
  },
  audioTtsIcon: {
    fontSize: 16,
  },
  audioTtsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#380d00',
  },
  heroDescription: {
    fontSize: 13,
    color: '#41493e',
    lineHeight: 18,
    marginTop: -4,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radii.card,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  landscapeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  landscapeIcon: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111c2d',
  },
  cardCadastral: {
    fontSize: 12,
    color: '#41493e',
  },
  verifiedBadge: {
    backgroundColor: '#e7eeff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00450d',
  },
  daEndorsementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f3ff',
    padding: 10,
    borderRadius: Radii.medium,
  },
  daIcon: {
    fontSize: 18,
  },
  daText: {
    fontSize: 12,
    color: '#111c2d',
    flex: 1,
  },
  daBold: {
    fontWeight: '700',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bentoCell: {
    width: '48%',
    backgroundColor: '#f0f3ff',
    padding: 10,
    borderRadius: Radii.medium,
    gap: 2,
  },
  bentoCellSpan2: {
    width: '100%',
  },
  bentoLabel: {
    fontSize: 11,
    color: '#41493e',
    fontWeight: '500',
  },
  bentoBigValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111c2d',
  },
  bentoSub: {
    fontSize: 11,
    color: '#41493e',
  },
  bentoSoilTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111c2d',
  },
  bentoSoilDesc: {
    fontSize: 11,
    color: '#41493e',
    lineHeight: 15,
  },
  geoMapBox: {
    width: '100%',
    height: 110,
    borderRadius: Radii.medium,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e7eeff',
  },
  geoMapImg: {
    width: '100%',
    height: '100%',
  },
  geoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 28, 45, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  geoCoordsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  milestonesCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radii.card,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestonesTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111c2d',
  },
  milestonesSubtitle: {
    fontSize: 12,
    color: '#41493e',
  },
  progressPercentPill: {
    backgroundColor: '#acf4a4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#002203',
  },
  timeline: {
    gap: 12,
    paddingLeft: 4,
  },
  timelineStep: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  timelineStepActive: {
    backgroundColor: '#f0f3ff',
    padding: 8,
    borderRadius: Radii.medium,
  },
  timelineStepDimmed: {
    opacity: 0.6,
  },
  timelineNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNodeDone: {
    backgroundColor: '#006e1c',
  },
  timelineNodeActive: {
    backgroundColor: '#00450d',
    borderWidth: 3,
    borderColor: '#94f990',
  },
  timelineNodePending: {
    backgroundColor: '#d8e3fb',
  },
  nodeCheck: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  nodePulse: {
    color: '#acf4a4',
    fontSize: 10,
  },
  nodePendingIcon: {
    fontSize: 11,
  },
  timelineContent: {
    flex: 1,
  },
  stepTitleDone: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111c2d',
  },
  activeStepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepTitleActive: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00450d',
  },
  activeBadge: {
    backgroundColor: '#00450d',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  stepTitlePending: {
    fontSize: 13,
    fontWeight: '600',
    color: '#41493e',
  },
  stepDesc: {
    fontSize: 12,
    color: '#717a6d',
    marginTop: 2,
  },
  stepDescActive: {
    fontSize: 12,
    color: '#111c2d',
    fontWeight: '500',
    marginTop: 2,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radii.card,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyIcon: {
    fontSize: 20,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111c2d',
  },
  addRecordBtn: {
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addRecordBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00450d',
  },
  historyRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f0f3ff',
    padding: 10,
    borderRadius: Radii.medium,
    alignItems: 'center',
  },
  historyThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyYear: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111c2d',
  },
  activeTag: {
    backgroundColor: '#91f78e',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00450d',
  },
  closedTag: {
    backgroundColor: '#d8e3fb',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  closedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#41493e',
  },
  nRestoreTag: {
    backgroundColor: '#acf4a4',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  nRestoreTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#002203',
  },
  historyCropName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111c2d',
    marginTop: 2,
  },
  historyCropDetail: {
    fontSize: 11,
    color: '#717a6d',
  },
  ledgerCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radii.card,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ledgerIcon: {
    fontSize: 20,
  },
  ledgerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111c2d',
  },
  ledgerSubtitle: {
    fontSize: 12,
    color: '#717a6d',
  },
  ledgerTrending: {
    fontSize: 20,
  },
  ledgerMetricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ledgerCell: {
    flex: 1,
    backgroundColor: '#f0f3ff',
    borderRadius: Radii.medium,
    padding: 8,
    alignItems: 'center',
  },
  ledgerCellMargin: {
    backgroundColor: '#e7eeff',
    borderWidth: 1,
    borderColor: '#94f990',
  },
  ledgerLabel: {
    fontSize: 11,
    color: '#41493e',
  },
  costValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ba1a1a',
    marginTop: 2,
  },
  revenueValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111c2d',
    marginTop: 2,
  },
  marginLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00450d',
  },
  marginValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#006e1c',
    marginTop: 2,
  },
  ledgerNote: {
    fontSize: 9,
    color: '#717a6d',
    marginTop: 2,
  },
  marginNote: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00450d',
    marginTop: 2,
  },
  actionsContainer: {
    gap: Spacing.two,
    paddingTop: 4,
  },
  primaryActionBtn: {
    height: 52,
    backgroundColor: '#1b5e20',
    borderRadius: Radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryActionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#dee8ff',
    borderRadius: Radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111c2d',
  },
  archiveBtn: {
    height: 44,
    backgroundColor: '#ffdad6',
    borderRadius: Radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  archiveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#93000a',
  },
});
