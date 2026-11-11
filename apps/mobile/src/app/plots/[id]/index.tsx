import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, MapPin, Calendar, Compass, RefreshCw, Trash2 } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { VisualCard } from '@/components/VisualCard';
import { ConfirmSpoken } from '@/components/ConfirmSpoken';

export default function PlotDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const plot = {
    id: params.id || 'plot-1',
    name: 'Boku Eastern Parcel',
    area: '4 Timad (1.00 ha)',
    soil: 'Koticha (Black Vertisol)',
    drainage: 'Moderate',
    zone: 'Weyna Dega (1,950m)',
    location: '8.5432° N, 39.2711° E',
  };

  const cycles = [
    { id: 'c-2024', season: '2024 Meher', crop: 'Wheat (Kakaba)', yield: '32 qt/ha', status: 'ACTIVE' },
    { id: 'c-2023', season: '2023 Meher', crop: 'Teff (Quncho)', yield: '18 qt/ha', status: 'HARVESTED' },
    { id: 'c-2022', season: '2022 Meher', crop: 'Chickpea (Arerti)', yield: '22 qt/ha', status: 'HARVESTED' },
  ];

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{plot.name}</Text>
        <TouchableOpacity onPress={() => setShowDeleteConfirm(true)}>
          <Trash2 size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Plot Specs Card */}
        <View style={styles.specsCard}>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Area:</Text>
            <Text style={styles.specValue}>{plot.area}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Soil Type:</Text>
            <Text style={styles.specValue}>{plot.soil}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Agro-Zone:</Text>
            <Text style={styles.specValue}>{plot.zone}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Coordinates:</Text>
            <Text style={styles.specValue}>{plot.location}</Text>
          </View>
        </View>

        {/* 3-Year Crop Rotation Advisory Shortcut */}
        <TouchableOpacity
          style={styles.rotationBanner}
          onPress={() => router.push(`/plots/${plot.id}/rotation` as any)}
          activeOpacity={0.85}
        >
          <Compass size={24} color="#15803D" />
          <View style={styles.rotationTextWrapper}>
            <Text style={styles.rotationTitle}>3-Year Crop Rotation Plan</Text>
            <Text style={styles.rotationSub}>AI recommended break crops to restore soil nitrogen</Text>
          </View>
        </TouchableOpacity>

        {/* Seasonal History & Add Cycle */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>3-Year Crop Cycles</Text>
          <TouchableOpacity
            style={styles.addCycleBtn}
            onPress={() => router.push('/cycles/new')}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addCycleText}>{t('agronomy.addCycle')}</Text>
          </TouchableOpacity>
        </View>

        {cycles.map((c) => (
          <VisualCard
            key={c.id}
            title={`${c.crop} - ${c.season}`}
            subtitle={c.yield ? `Harvest: ${c.yield}` : 'Cycle in Progress'}
            badge={c.status}
            badgeColor={c.status === 'ACTIVE' ? '#16A34A' : '#71717A'}
            onPress={() => router.push(`/cycles/${c.id}` as any)}
          />
        ))}
      </ScrollView>

      <ConfirmSpoken
        visible={showDeleteConfirm}
        title="Delete Plot?"
        message="This plot will be soft-deleted. Historical crop cycles will remain archived."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmLabel="Confirm Delete"
      />

      <VoiceBar title={plot.name} readAloudText={`${plot.name}. ${plot.area}. ${plot.soil}`} />
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
    justifyContent: 'space-between',
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
    paddingBottom: 24,
  },
  specsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DFD9CB',
    padding: 16,
    marginBottom: 14,
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specLabel: {
    fontSize: 13,
    color: '#566153',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#151A14',
  },
  rotationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  rotationTextWrapper: {
    flex: 1,
  },
  rotationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
  },
  rotationSub: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#151A14',
  },
  addCycleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  addCycleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

