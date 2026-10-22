import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useVoice } from '@/context/VoiceContext';

export interface FarmerHomeScreenProps {
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

const PROFILE_AVATAR_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC4wdn2LdzpRWe7OOeVgFcUgRHaNzGyt6pLQxIAAdoA1jcy3yxCOieWMYkOvNqAq6v1Cft-XwWhn9jUSUftIU7z5Jc3BMkNw6c3RrW0rOW1nGqgXj3j5FQA6KigLpTzYyZIt5mIwZgj4-ldjODO5Y94XnHCYvLhCKPI_yrjjyv42y6Rh3h_FFOfvzL-PNotc0zSrYZItgb1Tsm37df-KtepqK1SfHB2T7byEntX1AFrZLFS_z1jOg2Y3A';

export function FarmerHomeScreen({ onNavigate }: FarmerHomeScreenProps) {
  const { user } = useAuth();
  const { speakText, stopSpeaking, isSpeaking, language } = useVoice();

  const handlePlayBriefing = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    void speakText(text, language);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Top App Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerBrand}>
            <View style={styles.logoBadge}>
              <MaterialIcons name="eco" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.brandTitle}>AgriIntel ET</Text>
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={14} color="#006E1C" />
                <Text style={styles.locationText}>Adama • Kebele 03</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              onPress={() => onNavigate?.('LanguageSelection')}
              style={styles.langSwitchButton}>
              <Text style={styles.langSwitchText}>አማ/OM</Text>
            </Pressable>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: PROFILE_AVATAR_URI }}
                style={styles.avatarImage}
              />
              <View style={styles.avatarOnlineDot} />
            </View>
          </View>
        </View>

        {/* Sync Status Bar */}
        <View style={styles.headerSubRow}>
          <Pressable
            onPress={() => onNavigate?.('SyncSettings')}
            style={styles.syncChip}>
            <View style={styles.syncDot} />
            <Text style={styles.syncChipText}>Synced • 0 pending</Text>
          </Pressable>
          <Text style={styles.dashboardSubtitle}>Home Dashboard</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 2. Personalized Farmer Greeting & Audio Dispatch */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingLeft}>
            <View style={styles.farmerIconCircle}>
              <MaterialIcons name="agriculture" size={26} color="#002203" />
            </View>
            <View style={styles.greetingTextGroup}>
              <Text style={styles.greetingSub}>እንኳን ደህና መጡ (Welcome)</Text>
              <Text style={styles.greetingName}>
                {user?.name || 'አርሶ አደር አበበ (Abebe)'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() =>
              handlePlayBriefing(
                'እንኳን ደህና መጡ። የዛሬው የእርሻ ሁኔታ፡ እርሻ ማረስ ይቻላል። ኬሚካል መርጨት በከፍተኛ ንፋስ ምክንያት ለጊዜው አይመከርም።'
              )
            }
            style={styles.audioBriefingButton}>
            <MaterialIcons
              name={isSpeaking ? 'stop' : 'volume-up'}
              size={18}
              color="#380D00"
            />
            <Text style={styles.audioBriefingText}>አዳምጥ</Text>
          </Pressable>
        </View>

        {/* 3. Urgent Outbreak & Spray Advisory Alert Banner */}
        <View style={styles.alertBanner}>
          <View style={styles.alertHeader}>
            <View style={styles.alertIconCircle}>
              <MaterialIcons name="warning" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.alertTitleGroup}>
              <Text style={styles.alertTag}>አስቸኳይ ማስጠንቀቂያ (Urgent Alert)</Text>
              <Text style={styles.alertTitle}>Yellow Rust Outbreak in East Shewa</Text>
            </View>
          </View>

          <Text style={styles.alertBody}>
            Rain forecasted in 48 hours. Spraying window closes{' '}
            <Text style={styles.alertHighlight}>today at 5:00 PM</Text> before high winds begin.
          </Text>

          {/* Pictorial Icon Strip */}
          <View style={styles.iconStrip}>
            <View style={styles.iconPill}>
              <MaterialIcons name="air" size={18} color="#FFB498" />
              <Text style={styles.iconPillText}>Wind: 18 km/h</Text>
            </View>
            <View style={styles.iconPill}>
              <MaterialIcons name="water-drop" size={18} color="#FFB498" />
              <Text style={styles.iconPillText}>Rain: 48h Window</Text>
            </View>
          </View>

          <View style={styles.alertFooter}>
            <Text style={styles.alertAdvisoryNumber}>MoA Extension Advisory #ER-88</Text>
            <Pressable
              onPress={() =>
                handlePlayBriefing(
                  'ማስጠንቀቂያ፡ በምስራቅ ሸዋ የቢጫ ዋግ በሽታ ተከስቷል። ዝናብ በ48 ሰዓት ውስጥ ስለሚጀምር ዛሬ ከቀኑ 11 ሰዓት በፊት ፀረ-ፈንገስ ይርጩ።'
                )
              }
              style={styles.alertAudioButton}>
              <MaterialIcons name="campaign" size={16} color="#380D00" />
              <Text style={styles.alertAudioText}>ድምፅ አጫውት</Text>
            </Pressable>
          </View>
        </View>

        {/* 4. Quick Farm-or-Not Decision Grid */}
        <View style={styles.decisionSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <MaterialIcons name="fact-check" size={20} color="#00450D" />
              <Text style={styles.sectionTitle}>
                የዛሬው የውሳኔ መመሪያ (Today's Decisions)
              </Text>
            </View>
            <Pressable
              onPress={() =>
                handlePlayBriefing(
                  'የዛሬው ውሳኔዎች፡ እርሻ ማረስ ይቻላል። ኬሚካል መርጨት ይቆይ። አጨዳ አይሆንም።'
                )
              }>
              <MaterialIcons name="volume-up" size={20} color="#006E1C" />
            </Pressable>
          </View>

          <View style={styles.decisionGrid}>
            {/* Plowing: GO */}
            <View style={styles.decisionCardGo}>
              <MaterialIcons name="agriculture" size={24} color="#00731E" />
              <Text style={styles.decisionLabel}>እርሻ (Plow)</Text>
              <View style={styles.badgeGo}>
                <Text style={styles.badgeGoText}>GO • ይቻላል</Text>
              </View>
              <Text style={styles.decisionSub}>Moisture OK</Text>
            </View>

            {/* Spraying: WAIT */}
            <View style={styles.decisionCardWait}>
              <MaterialIcons name="pest-control" size={24} color="#6C2200" />
              <Text style={styles.decisionLabel}>መድሃኒት (Spray)</Text>
              <View style={styles.badgeWait}>
                <Text style={styles.badgeWaitText}>WAIT • ቆይ</Text>
              </View>
              <Text style={styles.decisionSub}>High Wind</Text>
            </View>

            {/* Harvesting: NO */}
            <View style={styles.decisionCardNo}>
              <MaterialIcons name="content-cut" size={24} color="#263143" />
              <Text style={styles.decisionLabel}>አጨዳ (Harvest)</Text>
              <View style={styles.badgeNo}>
                <Text style={styles.badgeNoText}>NO • አይሆንም</Text>
              </View>
              <Text style={styles.decisionSub}>Rain Imminent</Text>
            </View>
          </View>
        </View>

        {/* 5. Active Monitored Plots Section */}
        <View style={styles.plotsSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <MaterialIcons name="fence" size={20} color="#00450D" />
              <Text style={styles.sectionTitle}>ንቁ ማሳዎች (Active Plots)</Text>
            </View>
            <Pressable onPress={() => onNavigate?.('PlotList')}>
              <Text style={styles.seeAllText}>View All (2)</Text>
            </Pressable>
          </View>

          {/* Plot 1: Lower Field (Teff Quncho) */}
          <View style={styles.plotCard}>
            <View style={styles.plotHeader}>
              <View style={styles.plotLeft}>
                <View style={styles.plotCropBadge}>
                  <MaterialIcons name="grain" size={24} color="#00450D" />
                </View>
                <View>
                  <View style={styles.plotNameRow}>
                    <Text style={styles.plotName}>Lower Field</Text>
                    <View style={styles.plotAreaBadge}>
                      <Text style={styles.plotAreaText}>2 Timad (0.5 Ha)</Text>
                    </View>
                  </View>
                  <Text style={styles.plotCropSub}>Teff (Quncho / ጤፍ)</Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  handlePlayBriefing(
                    'የታችኛው ማሳ፡ ጤፍ ቁንጮ። 38ኛው ቀን ላይ ይገኛል። 1ኛ ዩሪያ ተጨምሯል። ቀጣይ ስራ፡ አረም ማረም ከ3 ቀናት በኋላ።'
                  )
                }
                style={styles.plotAudioButton}>
                <MaterialIcons name="volume-up" size={18} color="#111C2D" />
              </Pressable>
            </View>

            {/* Progress Bar Timeline */}
            <View style={styles.timelineBox}>
              <View style={styles.timelineHeader}>
                <View style={styles.stageLabelRow}>
                  <MaterialIcons name="spa" size={16} color="#00450D" />
                  <Text style={styles.stageLabelText}>Vegetative Phase (38 DAS)</Text>
                </View>
                <Text style={styles.stageDayText}>Day 38 of 90</Text>
              </View>

              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: '42%' }]} />
              </View>

              <View style={styles.stageStepsRow}>
                <Text style={styles.stageStepText}>Seedling</Text>
                <Text style={[styles.stageStepText, styles.stageStepActive]}>
                  Vegetative
                </Text>
                <Text style={styles.stageStepText}>Flowering</Text>
                <Text style={styles.stageStepText}>Maturity</Text>
              </View>
            </View>

            {/* Soil & Urea Badges */}
            <View style={styles.plotTagsRow}>
              <View style={styles.plotTag}>
                <MaterialIcons name="terrain" size={14} color="#6C2200" />
                <Text style={styles.plotTagText}>Koticha (Black Vertisol)</Text>
              </View>
              <View style={styles.plotTagSuccess}>
                <MaterialIcons name="check-circle" size={14} color="#00731E" />
                <Text style={styles.plotTagSuccessText}>1st Urea Applied</Text>
              </View>
            </View>

            {/* Next Action */}
            <View style={styles.nextActionRow}>
              <View style={styles.nextActionLeft}>
                <MaterialIcons name="calendar-today" size={18} color="#00450D" />
                <Text style={styles.nextActionText}>
                  <Text style={styles.boldText}>Next Action: </Text>
                  Weeding due in <Text style={styles.highlightText}>3 days</Text>
                </Text>
              </View>
              <Pressable
                onPress={() => onNavigate?.('CropCycleHub', { plotId: 'demo-plot-1' })}
                style={styles.logEventButton}>
                <Text style={styles.logEventText}>Log Event</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 6. Quick Action Navigation Shortcuts */}
        <View style={styles.shortcutsSection}>
          <Text style={styles.sectionTitle}>የእርሻ መሳሪያዎች (Quick Tools)</Text>
          <View style={styles.shortcutsGrid}>
            <Pressable
              onPress={() => onNavigate?.('RegisterPlot')}
              style={styles.shortcutTile}>
              <View style={styles.shortcutIconWrap}>
                <MaterialIcons name="add-location-alt" size={24} color="#00450D" />
              </View>
              <Text style={styles.shortcutTileTitle}>Register Plot</Text>
            </Pressable>

            <Pressable
              onPress={() => onNavigate?.('UniversalLogger', { cycleId: 'demo-cycle-1' })}
              style={styles.shortcutTile}>
              <View style={styles.shortcutIconWrap}>
                <MaterialIcons name="edit-note" size={24} color="#00450D" />
              </View>
              <Text style={styles.shortcutTileTitle}>Log Event</Text>
            </Pressable>

            <Pressable
              onPress={() => onNavigate?.('PestDiagnosis')}
              style={styles.shortcutTile}>
              <View style={styles.shortcutIconWrap}>
                <MaterialIcons name="camera-alt" size={24} color="#00450D" />
              </View>
              <Text style={styles.shortcutTileTitle}>Diagnose Pest</Text>
            </Pressable>

            <Pressable
              onPress={() => onNavigate?.('WeatherForecast')}
              style={styles.shortcutTile}>
              <View style={styles.shortcutIconWrap}>
                <MaterialIcons name="wb-sunny" size={24} color="#00450D" />
              </View>
              <Text style={styles.shortcutTileTitle}>7-Day Weather</Text>
            </Pressable>

            <Pressable
              onPress={() => onNavigate?.('MarketPrices')}
              style={styles.shortcutTile}>
              <View style={styles.shortcutIconWrap}>
                <MaterialIcons name="storefront" size={24} color="#00450D" />
              </View>
              <Text style={styles.shortcutTileTitle}>Market Board</Text>
            </Pressable>

            <Pressable
              onPress={() => onNavigate?.('GrievanceChat')}
              style={styles.shortcutTile}>
              <View style={styles.shortcutIconWrap}>
                <MaterialIcons name="record-voice-over" size={24} color="#00450D" />
              </View>
              <Text style={styles.shortcutTileTitle}>Voice Box</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* 7. Bottom Navigation Bar (Stitch Tactile Navigation) */}
      <View style={styles.bottomTabBar}>
        <Pressable
          onPress={() => onNavigate?.('FarmerHome')}
          style={styles.tabItem}>
          <MaterialIcons name="home" size={24} color="#00450D" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
          <View style={styles.tabIndicatorActive} />
        </Pressable>

        <Pressable
          onPress={() => onNavigate?.('PlotList')}
          style={styles.tabItem}>
          <MaterialIcons name="grass" size={24} color="#717A6D" />
          <Text style={styles.tabLabel}>Plots</Text>
        </Pressable>

        <Pressable
          onPress={() => onNavigate?.('PestDiagnosis')}
          style={styles.tabItem}>
          <MaterialIcons name="biotech" size={24} color="#717A6D" />
          <Text style={styles.tabLabel}>Diagnostics</Text>
        </Pressable>

        <Pressable
          onPress={() => onNavigate?.('ProfileSetup')}
          style={styles.tabItem}>
          <MaterialIcons name="person" size={24} color="#717A6D" />
          <Text style={styles.tabLabel}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9FF',
  },
  header: {
    backgroundColor: '#F9F9FF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EEFF',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00450D',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  locationText: {
    fontSize: 11,
    color: '#41493E',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langSwitchButton: {
    backgroundColor: '#E7EEFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  langSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#006E1C',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  syncChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7EEFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    gap: 6,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#006E1C',
  },
  syncChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00731E',
  },
  dashboardSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 80,
    gap: 14,
  },
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F3FF',
    borderRadius: 14,
    padding: 12,
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  farmerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ACF4A4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingTextGroup: {
    flex: 1,
  },
  greetingSub: {
    fontSize: 11,
    color: '#41493E',
  },
  greetingName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111C2D',
  },
  audioBriefingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDBCF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 4,
  },
  audioBriefingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#380D00',
  },
  alertBanner: {
    backgroundColor: '#933100',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  alertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#BA1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitleGroup: {
    flex: 1,
  },
  alertTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB498',
    textTransform: 'uppercase',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  alertBody: {
    fontSize: 13,
    color: '#FFDBCE',
    lineHeight: 18,
  },
  alertHighlight: {
    fontWeight: '800',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  iconStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  iconPillText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  alertAdvisoryNumber: {
    fontSize: 11,
    color: '#FFB498',
  },
  alertAudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDBCF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  alertAudioText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#380D00',
  },
  decisionSection: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00450D',
  },
  decisionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  decisionCardGo: {
    flex: 1,
    backgroundColor: '#91F78E',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 110,
  },
  decisionCardWait: {
    flex: 1,
    backgroundColor: '#D8E3FB',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 110,
  },
  decisionCardNo: {
    flex: 1,
    backgroundColor: '#DEE8FF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 110,
  },
  decisionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
    marginTop: 2,
  },
  badgeGo: {
    backgroundColor: '#006E1C',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  badgeGoText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeWait: {
    backgroundColor: '#6C2200',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  badgeWaitText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeNo: {
    backgroundColor: '#263143',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  badgeNoText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  decisionSub: {
    fontSize: 10,
    color: '#41493E',
    marginTop: 2,
  },
  plotsSection: {
    gap: 8,
  },
  plotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  plotHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  plotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  plotCropBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E7EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plotNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plotName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111C2D',
  },
  plotAreaBadge: {
    backgroundColor: '#DEE8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  plotAreaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111C2D',
  },
  plotCropSub: {
    fontSize: 12,
    color: '#41493E',
    marginTop: 1,
  },
  plotAudioButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E7EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBox: {
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stageLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00450D',
  },
  stageDayText: {
    fontSize: 11,
    color: '#41493E',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CFDAF2',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00450D',
    borderRadius: 3,
  },
  stageStepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stageStepText: {
    fontSize: 10,
    color: '#717A6D',
  },
  stageStepActive: {
    fontWeight: '700',
    color: '#00450D',
  },
  plotTagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  plotTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7EEFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  plotTagText: {
    fontSize: 11,
    color: '#111C2D',
  },
  plotTagSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#91F78E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  plotTagSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00731E',
  },
  nextActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E7EEFF',
    borderRadius: 10,
    padding: 10,
  },
  nextActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  nextActionText: {
    fontSize: 12,
    color: '#111C2D',
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  highlightText: {
    fontWeight: '800',
    color: '#6C2200',
  },
  logEventButton: {
    backgroundColor: '#00450D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logEventText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shortcutsSection: {
    gap: 8,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shortcutTile: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  shortcutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTileTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111C2D',
    textAlign: 'center',
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E7EEFF',
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minWidth: 60,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    color: '#717A6D',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: '#00450D',
  },
  tabIndicatorActive: {
    position: 'absolute',
    bottom: 0,
    width: 16,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#00450D',
  },
});
