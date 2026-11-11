import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { syncEngine } from '@/database/sync';

const cropsCatalog = [
  { id: 'crop-wheat', name: 'Wheat (ስንዴ)', varieties: ['Kakaba (Approved)', 'Dega (Approved)', 'Ogolcho'] },
  { id: 'crop-teff', name: 'Teff (ጤፍ)', varieties: ['Quncho (Approved)', 'Magna', 'Tsedey'] },
  { id: 'crop-maize', name: 'Maize (በቆሎ)', varieties: ['BH-661 (Approved)', 'BH-546'] },
  { id: 'crop-chickpea', name: 'Chickpea (ሽንብራ)', varieties: ['Arerti (Approved)', 'Habru'] },
];

export default function AddCropCycleScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [season, setSeason] = useState<'MEHER' | 'BELG'>('MEHER');
  const [seasonYear, setSeasonYear] = useState('2024');
  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const [selectedVariety, setSelectedVariety] = useState('Kakaba (Approved)');
  const [saving, setSaving] = useState(false);

  const activeCrop = cropsCatalog[selectedCropIndex];

  const handleSaveCycle = () => {
    setSaving(true);
    syncEngine.enqueueOperation({
      table_name: 'crop_cycles',
      record_id: 'cycle-' + Date.now(),
      op_type: 'CREATE',
      payload: {
        season,
        season_year: parseInt(seasonYear, 10),
        crop_name: activeCrop.name,
        variety_name: selectedVariety,
        current_stage: 'LAND_PREPARATION',
        status: 'ACTIVE',
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
        <Text style={styles.headerTitle}>{t('agronomy.addCycle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Season Selector */}
        <Text style={styles.sectionLabel}>{t('agronomy.season')}</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, season === 'MEHER' && styles.activeToggleBtn]}
            onPress={() => setSeason('MEHER')}
          >
            <Text style={[styles.toggleText, season === 'MEHER' && styles.activeToggleText]}>
              {t('agronomy.meher')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, season === 'BELG' && styles.activeToggleBtn]}
            onPress={() => setSeason('BELG')}
          >
            <Text style={[styles.toggleText, season === 'BELG' && styles.activeToggleText]}>
              {t('agronomy.belg')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Crop Master Picker */}
        <Text style={styles.sectionLabel}>{t('agronomy.crop')}</Text>
        <View style={styles.cropsGrid}>
          {cropsCatalog.map((crop, idx) => (
            <TouchableOpacity
              key={crop.id}
              style={[
                styles.cropCard,
                selectedCropIndex === idx && styles.selectedCropCard,
              ]}
              onPress={() => {
                setSelectedCropIndex(idx);
                setSelectedVariety(crop.varieties[0]);
              }}
            >
              <Text style={[styles.cropName, selectedCropIndex === idx && styles.selectedCropText]}>
                {crop.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Variety Filtered to Agro-Zone */}
        <Text style={styles.sectionLabel}>{t('agronomy.variety')} (Zone Approved)</Text>
        <View style={styles.varietyList}>
          {activeCrop.varieties.map((varName) => {
            const isApproved = varName.includes('Approved');
            return (
              <TouchableOpacity
                key={varName}
                style={[
                  styles.varietyRow,
                  selectedVariety === varName && styles.selectedVarietyRow,
                ]}
                onPress={() => setSelectedVariety(varName)}
              >
                <Text style={styles.varietyName}>{varName}</Text>
                {selectedVariety === varName ? (
                  <Check size={18} color="#16A34A" />
                ) : !isApproved ? (
                  <AlertTriangle size={16} color="#C78326" />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveCycle}>
          <Text style={styles.saveBtnText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <VoiceBar title={t('agronomy.addCycle')} readAloudText={t('agronomy.addCycle')} />
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
    marginTop: 14,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFD9CB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeToggleBtn: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#566153',
  },
  activeToggleText: {
    color: '#15803D',
  },
  cropsGrid: {
    gap: 8,
  },
  cropCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFD9CB',
    padding: 14,
    borderRadius: 12,
  },
  selectedCropCard: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  cropName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#151A14',
  },
  selectedCropText: {
    color: '#15803D',
  },
  varietyList: {
    gap: 6,
  },
  varietyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 12,
    borderRadius: 10,
  },
  selectedVarietyRow: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  varietyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#151A14',
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
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

