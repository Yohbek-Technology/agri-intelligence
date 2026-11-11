import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Layers } from 'lucide-react-native';

export type SoilType = 'KOTICHA_VERTISOL' | 'BEDA_NITISOL' | 'SANDY' | 'CLAY' | 'LOAM';

interface SoilOption {
  type: SoilType;
  title: string;
  localName: string;
  description: string;
  color: string;
}

const soilOptions: SoilOption[] = [
  {
    type: 'KOTICHA_VERTISOL',
    title: 'Koticha',
    localName: 'Black Vertisol',
    description: 'Heavy clay soil, cracks deeply when dry, rich in nutrients',
    color: '#262626',
  },
  {
    type: 'BEDA_NITISOL',
    title: 'Beda',
    localName: 'Red Nitisol',
    description: 'Deep red clay, fertile, excellent structure and drainage',
    color: '#881337',
  },
  {
    type: 'SANDY',
    title: 'Sandy Soil',
    localName: 'Ashawa',
    description: 'Coarse texture, fast drainage, requires frequent moisture',
    color: '#D97706',
  },
  {
    type: 'CLAY',
    title: 'Clay Soil',
    localName: 'Bole',
    description: 'Fine particles, retains water and fertilizer, slow drainage',
    color: '#451A03',
  },
  {
    type: 'LOAM',
    title: 'Loam Soil',
    localName: 'Kefil',
    description: 'Balanced mix of sand, silt, and clay; ideal for most crops',
    color: '#15803D',
  },
];

interface SoilTypeCardProps {
  selected?: SoilType;
  onSelect: (type: SoilType) => void;
}

export function SoilTypeCard({ selected, onSelect }: SoilTypeCardProps) {
  return (
    <View style={styles.grid}>
      {soilOptions.map((opt) => {
        const isSelected = selected === opt.type;
        return (
          <TouchableOpacity
            key={opt.type}
            style={[
              styles.soilCard,
              isSelected && styles.selectedSoilCard,
            ]}
            onPress={() => onSelect(opt.type)}
            activeOpacity={0.8}
          >
            <View style={[styles.colorStrip, { backgroundColor: opt.color }]} />
            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Text style={styles.soilName}>{opt.title}</Text>
                <Text style={styles.localName}>({opt.localName})</Text>
              </View>
              <Text style={styles.soilDesc} numberOfLines={2}>
                {opt.description}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 8,
  },
  soilCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2DBD0',
    overflow: 'hidden',
    elevation: 2,
  },
  selectedSoilCard: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  colorStrip: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  soilName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#151A14',
  },
  localName: {
    fontSize: 13,
    color: '#566153',
    fontWeight: '500',
  },
  soilDesc: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 4,
  },
});

