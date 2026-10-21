import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';
import {
  intelligenceService,
  WeatherCurrentData,
  DailyForecast,
  WeatherAlert,
} from '@/services/api/intelligence-service';

export interface WeatherForecastScreenProps {
  plotId?: string;
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export function WeatherForecastScreen({ plotId, onNavigate }: WeatherForecastScreenProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherCurrentData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [advisoryLang, setAdvisoryLang] = useState<'am' | 'en'>('am');
  const [isPlayingAdvisory, setIsPlayingAdvisory] = useState<boolean>(false);
  const [advisoryProgress, setAdvisoryProgress] = useState<number>(0);
  const [playingCardAudio, setPlayingCardAudio] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, [plotId]);

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      const [currentRes, forecastRes, alertsRes] = await Promise.all([
        intelligenceService.fetchWeatherCurrent(),
        intelligenceService.fetchWeatherForecast(),
        intelligenceService.fetchWeatherAlerts(),
      ]);

      if (currentRes.success && currentRes.data) {
        setWeatherData(currentRes.data);
      }
      if (forecastRes.success && forecastRes.data) {
        setForecast(forecastRes.data);
      }
      if (alertsRes.success && alertsRes.data) {
        setAlerts(alertsRes.data);
      }
    } catch {
      // Fallbacks handled by service
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdvisory = () => {
    setIsPlayingAdvisory((prev) => !prev);
    if (!isPlayingAdvisory) {
      setAdvisoryProgress(35);
    }
  };

  const handleToggleCardAudio = (key: string) => {
    if (playingCardAudio === key) {
      setPlayingCardAudio(null);
    } else {
      setPlayingCardAudio(key);
    }
  };

  if (loading || !weatherData) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Fetching Hyperlocal Agro-Weather Telemetry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { current, decisions } = weatherData;
  const activeAlert = alerts[0];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Active Field Parcel Selector Bar */}
        <View style={styles.parcelBar}>
          <View style={styles.parcelLeft}>
            <View style={styles.parcelIconCircle}>
              <Text style={styles.parcelGlyph}>🗺️</Text>
            </View>
            <View style={styles.parcelInfoCol}>
              <View style={styles.parcelStatusRow}>
                <Text style={styles.parcelStatusLabel}>Active Field Parcel</Text>
                <View style={styles.parcelStatusDot} />
              </View>
              <Text style={styles.parcelTitle}>Lower Field (Teff - Koticha)</Text>
              <Text style={styles.parcelSub}>Heavy Clay • 1,710m Elev</Text>
            </View>
          </View>
          <Pressable
            style={styles.tuneButton}
            onPress={() => onNavigate && onNavigate('Plots')}
          >
            <Text style={styles.tuneButtonIcon}>⚙️</Text>
          </Pressable>
        </View>

        {/* Extreme Weather Alert Ribbon (Frost Warning / ውርጭ ማስጠንቀቂያ) */}
        {activeAlert && (
          <View style={styles.alertRibbon}>
            <View style={styles.alertIconBadge}>
              <Text style={styles.alertIconGlyph}>❄️</Text>
            </View>
            <View style={styles.alertContentCol}>
              <View style={styles.alertHeaderRow}>
                <Text style={styles.alertTitle}>
                  {activeAlert.details.title}
                </Text>
                <View style={styles.alertTimingBadge}>
                  <Text style={styles.alertTimingText}>
                    {activeAlert.details.timing || 'Wed Night'}
                  </Text>
                </View>
              </View>
              <Text style={styles.alertDescription}>
                {activeAlert.details.description}
              </Text>
              <View style={styles.alertActionRow}>
                <Pressable
                  style={[
                    styles.alertListenBtn,
                    playingCardAudio === 'alert' && styles.alertListenBtnActive,
                  ]}
                  onPress={() => handleToggleCardAudio('alert')}
                >
                  <Text style={styles.alertListenBtnIcon}>
                    {playingCardAudio === 'alert' ? '⏸' : '🔊'}
                  </Text>
                  <Text style={styles.alertListenBtnText}>
                    {playingCardAudio === 'alert' ? 'Playing' : 'አዳምጥ (Listen)'}
                  </Text>
                </Pressable>
                <Text style={styles.alertDuration}>0:24 min</Text>
              </View>
            </View>
          </View>
        )}

        {/* Weekly 60-Second Audio Advisory Banner */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryHeaderRow}>
            <View style={styles.advisoryBrandRow}>
              <View style={styles.advisoryIconBox}>
                <Text style={styles.advisoryIconGlyph}>📻</Text>
              </View>
              <View>
                <Text style={styles.advisoryHeadline}>Weekly Voice Advisory</Text>
                <Text style={styles.advisorySubHeadline}>የሳምንቱ የአየር ሁኔታ ምክር</Text>
              </View>
            </View>
            <View style={styles.langPillContainer}>
              <Pressable
                style={[
                  styles.langPillOption,
                  advisoryLang === 'am' && styles.langPillOptionActive,
                ]}
                onPress={() => setAdvisoryLang('am')}
              >
                <Text
                  style={[
                    styles.langPillText,
                    advisoryLang === 'am' && styles.langPillTextActive,
                  ]}
                >
                  አማርኛ
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.langPillOption,
                  advisoryLang === 'en' && styles.langPillOptionActive,
                ]}
                onPress={() => setAdvisoryLang('en')}
              >
                <Text
                  style={[
                    styles.langPillText,
                    advisoryLang === 'en' && styles.langPillTextActive,
                  ]}
                >
                  EN
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Audio Player Waveform Module */}
          <View style={styles.waveformContainer}>
            <Pressable
              style={styles.masterPlayBtn}
              onPress={handleToggleAdvisory}
            >
              <Text style={styles.masterPlayBtnIcon}>
                {isPlayingAdvisory ? '⏸' : '▶'}
              </Text>
            </Pressable>
            <View style={styles.waveformCol}>
              <View style={styles.waveformMetaRow}>
                <Text style={styles.waveformTimer}>
                  {isPlayingAdvisory ? '0:35' : '0:00'}
                </Text>
                <View style={styles.agronomistPill}>
                  <View style={styles.agronomistPulseDot} />
                  <Text style={styles.agronomistName}>Agronomist Melaku F.</Text>
                </View>
                <Text style={styles.waveformDuration}>1:00</Text>
              </View>

              {/* Synthetic Audio Waveform Bars */}
              <View style={styles.barsVisualizer}>
                {[6, 12, 22, 16, 26, 20, 14, 24, 18, 10, 16, 20, 12, 8].map(
                  (height, index) => {
                    const isPlayed = (index / 14) * 100 <= advisoryProgress;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.waveBar,
                          { height },
                          isPlayed
                            ? { backgroundColor: Colors.light.primary }
                            : { backgroundColor: '#CBD5E1' },
                        ]}
                      />
                    );
                  }
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Live Micro-Climate Conditions Tile */}
        <View style={styles.liveConditionsCard}>
          <View style={styles.liveHeaderRow}>
            <View style={styles.liveTitleRow}>
              <Text style={styles.liveWeatherIcon}>☀️</Text>
              <Text style={styles.liveHeadline}>Adama Live Weather</Text>
            </View>
            <View style={styles.updateBadge}>
              <Text style={styles.updateBadgeText}>Updated 12m ago</Text>
            </View>
          </View>

          <View style={styles.tempHighlightRow}>
            <View style={styles.tempLeftBlock}>
              <Text style={styles.tempNumber}>{current.tempC}°</Text>
              <Text style={styles.tempUnit}>C</Text>
              <Text style={styles.tempCondition}>{current.condition}</Text>
            </View>
            <View style={styles.soilPill}>
              <Text style={styles.soilPillIcon}>💧</Text>
              <Text style={styles.soilPillText}>Optimal Soil</Text>
            </View>
          </View>

          {/* Micro Soil & Atmospheric 4-Metric Grid */}
          <View style={styles.microGrid}>
            <View style={styles.microTile}>
              <View style={styles.microIconCircle}>
                <Text style={styles.microGlyph}>💨</Text>
              </View>
              <View>
                <Text style={styles.microLabel}>Wind Speed</Text>
                <Text style={styles.microVal}>{current.windSpeedKmh} km/h</Text>
                <Text style={[styles.microSub, { color: Colors.light.primary }]}>
                  Safe for spray
                </Text>
              </View>
            </View>

            <View style={styles.microTile}>
              <View style={styles.microIconCircle}>
                <Text style={styles.microGlyph}>🌧️</Text>
              </View>
              <View>
                <Text style={styles.microLabel}>Rain Chance</Text>
                <Text style={styles.microVal}>{current.rainProbabilityPercent}%</Text>
                <Text style={styles.microSub}>{current.expectedRainMm} mm exp.</Text>
              </View>
            </View>

            <View style={styles.microTile}>
              <View style={styles.microIconCircle}>
                <Text style={styles.microGlyph}>💧</Text>
              </View>
              <View>
                <Text style={styles.microLabel}>Humidity</Text>
                <Text style={styles.microVal}>{current.humidityPercent}%</Text>
                <Text style={styles.microSub}>Dew dries 10:00</Text>
              </View>
            </View>

            <View style={styles.microTile}>
              <View style={styles.microIconCircle}>
                <Text style={styles.microGlyph}>🌱</Text>
              </View>
              <View>
                <Text style={styles.microLabel}>Koticha Clay</Text>
                <Text style={styles.microVal}>{current.soilCondition.state}</Text>
                <Text style={[styles.microSub, { color: Colors.light.primary }]}>
                  Good traction
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 'Farm or Not' Intelligence Matrix */}
        <View style={styles.matrixHeaderRow}>
          <View style={styles.matrixTitleBlock}>
            <Text style={styles.matrixIcon}>🌾</Text>
            <Text style={styles.matrixHeading}>Today's 'Farm or Not' Decisions</Text>
          </View>
          <Text style={styles.matrixSubHeading}>Adama Kebele 03</Text>
        </View>

        {/* Matrix Card 1: Plowing */}
        <View style={styles.decisionCard}>
          <View style={styles.decisionHeader}>
            <View style={styles.decisionTitleRow}>
              <View style={styles.decisionIconCircle}>
                <Text style={styles.decisionGlyph}>🚜</Text>
              </View>
              <View>
                <Text style={styles.decisionTitle}>{decisions.plowing.title}</Text>
                <Text style={styles.decisionSub}>{decisions.plowing.subtitle}</Text>
              </View>
            </View>
            <View style={[styles.decisionPill, styles.decisionPillGo]}>
              <Text style={styles.decisionPillTextGo}>✓ GO</Text>
            </View>
          </View>
          <Text style={styles.decisionSummaryBox}>{decisions.plowing.summary}</Text>
          <View style={styles.decisionFooterRow}>
            <Text style={styles.decisionWindowText}>
              🕒 Best: {decisions.plowing.recommendedWindow}
            </Text>
            <Pressable
              style={[
                styles.cardListenBtn,
                playingCardAudio === 'plowing' && styles.cardListenBtnActive,
              ]}
              onPress={() => handleToggleCardAudio('plowing')}
            >
              <Text style={styles.cardListenBtnText}>
                {playingCardAudio === 'plowing' ? 'Playing' : '🔊 አዳምጥ'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Matrix Card 2: Spraying */}
        <View style={styles.decisionCard}>
          <View style={styles.decisionHeader}>
            <View style={styles.decisionTitleRow}>
              <View style={styles.decisionIconCircle}>
                <Text style={styles.decisionGlyph}>💧</Text>
              </View>
              <View>
                <Text style={styles.decisionTitle}>{decisions.spraying.title}</Text>
                <Text style={styles.decisionSub}>{decisions.spraying.subtitle}</Text>
              </View>
            </View>
            <View style={[styles.decisionPill, styles.decisionPillGo]}>
              <Text style={styles.decisionPillTextGo}>✓ GO</Text>
            </View>
          </View>
          <View style={styles.sprayHighlightBox}>
            <Text style={styles.sprayWindowBadge}>
              ⏰ Window: {decisions.spraying.recommendedWindow}
            </Text>
            <Text style={styles.spraySummaryText}>{decisions.spraying.summary}</Text>
          </View>
          <View style={styles.decisionFooterRow}>
            <Text style={styles.decisionWindowText}>
              💨 Drift risk: {decisions.spraying.driftRisk || 'Minimum'}
            </Text>
            <Pressable
              style={[
                styles.cardListenBtn,
                playingCardAudio === 'spraying' && styles.cardListenBtnActive,
              ]}
              onPress={() => handleToggleCardAudio('spraying')}
            >
              <Text style={styles.cardListenBtnText}>
                {playingCardAudio === 'spraying' ? 'Playing' : '🔊 አዳምጥ'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Matrix Card 3: Harvesting */}
        <View style={styles.decisionCard}>
          <View style={styles.decisionHeader}>
            <View style={styles.decisionTitleRow}>
              <View style={styles.decisionIconCircle}>
                <Text style={styles.decisionGlyph}>🌾</Text>
              </View>
              <View>
                <Text style={styles.decisionTitle}>{decisions.harvesting.title}</Text>
                <Text style={styles.decisionSub}>{decisions.harvesting.subtitle}</Text>
              </View>
            </View>
            <View style={[styles.decisionPill, styles.decisionPillWait]}>
              <Text style={styles.decisionPillTextWait}>⏳ WAIT</Text>
            </View>
          </View>
          <Text style={styles.decisionSummaryBox}>{decisions.harvesting.summary}</Text>
          <View style={styles.decisionFooterRow}>
            <Text style={[styles.decisionWindowText, { color: '#B45309' }]}>
              ☀️ {decisions.harvesting.recommendedWindow}
            </Text>
            <Pressable
              style={[
                styles.cardListenBtn,
                playingCardAudio === 'harvesting' && styles.cardListenBtnActive,
              ]}
              onPress={() => handleToggleCardAudio('harvesting')}
            >
              <Text style={styles.cardListenBtnText}>
                {playingCardAudio === 'harvesting' ? 'Playing' : '🔊 አዳምጥ'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 7-Day Agricultural Outlook */}
        <View style={styles.outlookSection}>
          <View style={styles.outlookHeaderRow}>
            <View style={styles.outlookTitleRow}>
              <Text style={styles.outlookIcon}>📅</Text>
              <Text style={styles.outlookHeadline}>7-Day Farming Outlook</Text>
            </View>
            <Text style={styles.outlookSubHeadline}>Rainfall & Spray Logic</Text>
          </View>

          {/* Daily Cards Stack */}
          <View style={styles.dailyStack}>
            {forecast.map((day, idx) => (
              <View key={idx} style={styles.dailyRow}>
                <View style={styles.dailyLeftCol}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeTitle}>{day.dayLabel}</Text>
                    <Text style={styles.dayBadgeSub}>{day.dayOfWeek}</Text>
                  </View>
                  <View style={styles.dayInfoCol}>
                    <Text style={styles.dayConditionText}>{day.condition}</Text>
                    <Text style={styles.daySpraySuitability}>
                      {day.sprayingSuitability}
                    </Text>
                  </View>
                </View>

                <View style={styles.dailyRightCol}>
                  <Text style={styles.dailyTempRange}>
                    {day.tempMaxC}° / {day.tempMinC}°
                  </Text>
                  <View
                    style={[
                      styles.ratingBadge,
                      day.suitabilityRating === 'GO' && styles.ratingGo,
                      day.suitabilityRating === 'CAUTION' && styles.ratingCaution,
                      day.suitabilityRating === 'NO' && styles.ratingNo,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ratingText,
                        day.suitabilityRating === 'GO' && styles.ratingTextGo,
                        day.suitabilityRating === 'CAUTION' && styles.ratingTextCaution,
                        day.suitabilityRating === 'NO' && styles.ratingTextNo,
                      ]}
                    >
                      {day.suitabilityRating}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <VoiceAssistant />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  parcelBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.lg,
    padding: Spacing.sm,
  },
  parcelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  parcelIconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parcelGlyph: {
    fontSize: 20,
  },
  parcelInfoCol: {
    flex: 1,
  },
  parcelStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  parcelStatusLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  parcelStatusDot: {
    width: 6,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.primary,
  },
  parcelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  parcelSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  tuneButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tuneButtonIcon: {
    fontSize: 18,
  },
  alertRibbon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#9A3412',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  alertIconBadge: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconGlyph: {
    fontSize: 20,
  },
  alertContentCol: {
    flex: 1,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFEDD5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertTimingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  alertTimingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  alertDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 19,
    marginTop: 4,
    fontWeight: '500',
  },
  alertActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  alertListenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  alertListenBtnActive: {
    backgroundColor: '#FDBA74',
  },
  alertListenBtnIcon: {
    fontSize: 13,
  },
  alertListenBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
  },
  alertDuration: {
    fontSize: 12,
    color: '#FED7AA',
    fontWeight: '600',
  },
  advisoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
  },
  advisoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advisoryBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advisoryIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryIconGlyph: {
    fontSize: 16,
  },
  advisoryHeadline: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  advisorySubHeadline: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  langPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.full,
    padding: 2,
  },
  langPillOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  langPillOptionActive: {
    backgroundColor: Colors.light.primary,
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  langPillTextActive: {
    color: '#FFFFFF',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.md,
    padding: Spacing.sm,
  },
  masterPlayBtn: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  masterPlayBtnIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 2,
  },
  waveformCol: {
    flex: 1,
    gap: 6,
  },
  waveformMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waveformTimer: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  agronomistPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agronomistPulseDot: {
    width: 6,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.primary,
  },
  agronomistName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  waveformDuration: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  barsVisualizer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 26,
  },
  waveBar: {
    width: 5,
    borderRadius: Radii.full,
  },
  liveConditionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
  },
  liveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveWeatherIcon: {
    fontSize: 20,
  },
  liveHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  updateBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  updateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  tempHighlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 2,
  },
  tempLeftBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tempNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.light.text,
  },
  tempUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginLeft: 2,
  },
  tempCondition: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
    marginLeft: 10,
  },
  soilPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  soilPillIcon: {
    fontSize: 12,
  },
  soilPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  microGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 4,
  },
  microTile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  microIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  microGlyph: {
    fontSize: 16,
  },
  microLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  microVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  microSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  matrixTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matrixIcon: {
    fontSize: 18,
  },
  matrixHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },
  matrixSubHeading: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  decisionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: Spacing.xs,
  },
  decisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  decisionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  decisionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decisionGlyph: {
    fontSize: 20,
  },
  decisionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  decisionSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  decisionPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.full,
  },
  decisionPillGo: {
    backgroundColor: '#DCFCE7',
  },
  decisionPillWait: {
    backgroundColor: '#FEF3C7',
  },
  decisionPillTextGo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  decisionPillTextWait: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  decisionSummaryBox: {
    fontSize: 13,
    color: Colors.light.text,
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: Radii.md,
    lineHeight: 19,
    marginTop: 4,
  },
  sprayHighlightBox: {
    backgroundColor: '#F0FDF4',
    padding: Spacing.sm,
    borderRadius: Radii.md,
    gap: 4,
    marginTop: 4,
  },
  sprayWindowBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  spraySummaryText: {
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
  decisionFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  decisionWindowText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  cardListenBtn: {
    backgroundColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  cardListenBtnActive: {
    backgroundColor: '#FB923C',
  },
  cardListenBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A3412',
  },
  outlookSection: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  outlookHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outlookTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  outlookIcon: {
    fontSize: 18,
  },
  outlookHeadline: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },
  outlookSubHeadline: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  dailyStack: {
    gap: 6,
  },
  dailyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dailyLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dayBadge: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.text,
  },
  dayBadgeSub: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  dayInfoCol: {
    flex: 1,
  },
  dayConditionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  daySpraySuitability: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  dailyRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dailyTempRange: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingGo: {
    backgroundColor: '#DCFCE7',
  },
  ratingCaution: {
    backgroundColor: '#FEF3C7',
  },
  ratingNo: {
    backgroundColor: '#FEE2E2',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ratingTextGo: {
    color: '#15803D',
  },
  ratingTextCaution: {
    color: '#B45309',
  },
  ratingTextNo: {
    color: '#DC2626',
  },
});
