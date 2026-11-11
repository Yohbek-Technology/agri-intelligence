import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Sprout, MapPin, ChevronRight } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VisualCard } from '@/components/VisualCard';
import { EmptyState } from '@/components/EmptyState';

export default function MyFarmsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [plots, setPlots] = useState([
    {
      id: 'plot-1',
      name: 'Boku Eastern Parcel',
      area_local: '4 Timad',
      area_ha: '1.0 ha',
      crop: 'Wheat (Kakaba)',
      stage: 'Tillering',
      soil: 'Koticha (Black Vertisol)',
    },
    {
      id: 'plot-2',
      name: 'River Valley Plot',
      area_local: '2 Kert',
      area_ha: '0.5 ha',
      crop: 'Teff (Quncho)',
      stage: 'Land Preparation',
      soil: 'Beda (Red Nitisol)',
    },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('plots.title')}</Text>
          <Text style={styles.subtitle}>{plots.length} Registered Plots</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/plots/new')}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{t('plots.addPlot')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {plots.length === 0 ? (
          <EmptyState
            title="No plots registered yet"
            description="Record your farm plots with GPS boundaries, soil profiles, and local land units."
            actionLabel={t('plots.addPlot')}
            onAction={() => router.push('/plots/new')}
          />
        ) : (
          plots.map((plot) => (
            <VisualCard
              key={plot.id}
              title={plot.name}
              subtitle={`${plot.area_local} [${plot.area_ha}] • ${plot.soil}`}
              badge={plot.stage}
              badgeColor="#16A34A"
              icon={<Sprout size={24} color="#16A34A" />}
              onPress={() => router.push(`/plots/${plot.id}` as any)}
            >
              <View style={styles.cardFooter}>
                <View style={styles.cropInfo}>
                  <Text style={styles.cropLabel}>{t('agronomy.crop')}:</Text>
                  <Text style={styles.cropValue}>{plot.crop}</Text>
                </View>
                <ChevronRight size={18} color="#566153" />
              </View>
            </VisualCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DFD9CB',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#151A14',
  },
  subtitle: {
    fontSize: 13,
    color: '#566153',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 2,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cropLabel: {
    fontSize: 13,
    color: '#71717A',
  },
  cropValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
  },
});

