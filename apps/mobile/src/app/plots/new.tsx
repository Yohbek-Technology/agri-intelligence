import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Navigation, ArrowLeft, Check } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { VoiceTextInput } from '@/components/VoiceTextInput';
import { SoilTypeCard, SoilType } from '@/components/SoilTypeCard';
import { locationService, LocationResult } from '@/services/location';
import { toHectares, classifyAgroZone } from '@repo/domain';
import { syncEngine } from '@/database/sync';

export default function RegisterPlotScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [plotName, setPlotName] = useState('');
  const [areaValue, setAreaValue] = useState('');
  const [areaUnit, setAreaUnit] = useState<'TIMAD' | 'KERT' | 'HECTARE'>('TIMAD');
  const [soilType, setSoilType] = useState<SoilType>('KOTICHA_VERTISOL');
  const [drainage, setDrainage] = useState<'POOR' | 'MODERATE' | 'GOOD' | 'EXCESSIVE'>('MODERATE');
  const [coords, setCoords] = useState<LocationResult | null>(null);
  const [capturingGps, setCapturingGps] = useState(false);
  const [saving, setSaving] = useState(false);

  const numericArea = parseFloat(areaValue) || 0;
  const computedHectares = toHectares(numericArea, areaUnit);
  const autoZone = coords?.zone ?? 'WEYNA_DEGA';

  const handleCaptureGps = async () => {
    setCapturingGps(true);
    try {
      const loc = await locationService.getCurrentPosition();
      setCoords(loc);
    } catch {
      // Fallback
    } finally {
      setCapturingGps(false);
    }
  };

  const handleSavePlot = async () => {
    if (!plotName || numericArea <= 0) return;
    setSaving(true);

    syncEngine.enqueueOperation({
      table_name: 'plots',
      record_id: 'plot-' + Date.now(),
      op_type: 'CREATE',
      payload: {
        plot_name: plotName,
        area_value: numericArea,
        area_unit: areaUnit,
        area_hectares: computedHectares,
        soil: soilType,
        drainage,
        zone: autoZone,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        altitude_m: coords?.altitudeM ? Math.round(coords.altitudeM) : null,
      },
      base_version: 0,
    });

    setTimeout(() => {
      setSaving(false);
      router.back();
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('plots.addPlot')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VoiceTextInput
          label={t('plots.plotName')}
          value={plotName}
          onChangeText={setPlotName}
          placeholder="e.g. Northern Valley Plot"
        />

        {/* GPS Capture Card */}
        <View style={styles.gpsCard}>
          <View style={styles.gpsInfo}>
            <MapPin size={22} color="#16A34A" />
            <View>
              <Text style={styles.gpsTitle}>GPS Location & Elevation</Text>
              <Text style={styles.gpsCoords}>
                {coords
                  ? `${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E (${Math.round(coords.altitudeM || 1950)}m)`
                  : 'No coordinates pinned yet'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.captureGpsBtn}
            onPress={handleCaptureGps}
            disabled={capturingGps}
          >
            {capturingGps ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Navigation size={18} color="#FFFFFF" />
            )}
            <Text style={styles.captureGpsText}>Pin GPS</Text>
          </TouchableOpacity>
        </View>

        {/* Area & Unit Selector */}
        <Text style={styles.sectionLabel}>{t('plots.landArea')}</Text>
        <View style={styles.areaRow}>
          <View style={styles.areaInputWrapper}>
            <VoiceTextInput
              value={areaValue}
              onChangeText={setAreaValue}
              placeholder="0.0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.unitToggles}>
            {(['TIMAD', 'KERT', 'HECTARE'] as const).map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[styles.unitBtn, areaUnit === unit && styles.activeUnitBtn]}
                onPress={() => setAreaUnit(unit)}
              >
                <Text style={[styles.unitText, areaUnit === unit && styles.activeUnitText]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Text style={styles.computedText}>
          Standardized Size: <Text style={styles.boldText}>{computedHectares.toFixed(2)} Hectares</Text>
        </Text>

        {/* Soil Type Selector */}
        <Text style={styles.sectionLabel}>{t('plots.soilType')}</Text>
        <SoilTypeCard selected={soilType} onSelect={setSoilType} />

        {/* Agro-climatic Zone Derived */}
        <View style={styles.zoneBox}>
          <Text style={styles.zoneLabel}>{t('plots.agroZone')}:</Text>
          <Text style={styles.zoneValue}>{autoZone} (Highland Reference)</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, (!plotName || numericArea <= 0) && styles.disabledBtn]}
          onPress={handleSavePlot}
          disabled={!plotName || numericArea <= 0 || saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <VoiceBar title={t('plots.addPlot')} readAloudText={t('plots.addPlot')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DFD9CB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A14',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFD9CB',
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
  },
  gpsCoords: {
    fontSize: 12,
    color: '#566153',
    marginTop: 2,
  },
  captureGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  captureGpsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
    marginTop: 14,
    marginBottom: 6,
  },
  areaRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  areaInputWrapper: {
    flex: 1,
  },
  unitToggles: {
    flexDirection: 'row',
    gap: 6,
  },
  unitBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  activeUnitBtn: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#566153',
  },
  activeUnitText: {
    color: '#15803D',
  },
  computedText: {
    fontSize: 13,
    color: '#566153',
    marginTop: 4,
  },
  boldText: {
    fontWeight: '800',
    color: '#16A34A',
  },
  zoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8F4',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  zoneLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#566153',
  },
  zoneValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
  },
  saveButton: {
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    elevation: 3,
  },
  disabledBtn: {
    backgroundColor: '#9CA3AF',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

