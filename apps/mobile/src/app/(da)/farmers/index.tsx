// M-30 DA Farmer Roster Screen
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, UserPlus, PhoneOff, Smartphone } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VisualCard } from '@/components/VisualCard';

export default function DaFarmerRosterScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [farmers, setFarmers] = useState([
    {
      id: 'f-1',
      name: 'Abebe Bikila',
      local_id: 'KB-2024-001',
      phone: '+251 91 123 4567',
      has_phone: true,
      plots_count: 2,
      status: 'APPROVED',
      kebele: 'Boku Shenen',
    },
    {
      id: 'f-2',
      name: 'Almaz Ayana',
      local_id: 'KB-2024-042',
      phone: null,
      has_phone: false,
      plots_count: 1,
      status: 'APPROVED',
      kebele: 'Boku Shenen',
    },
    {
      id: 'f-3',
      name: 'Kenisa Bekele',
      local_id: 'KB-2024-089',
      phone: '+251 92 987 6543',
      has_phone: true,
      plots_count: 3,
      status: 'PENDING',
      kebele: 'Boku Shenen',
    },
  ]);

  const maxCap = 50;
  const currentCount = farmers.length;

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.local_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Caseload Bar Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('da.farmerRoster')}</Text>
          <View style={styles.capBadge}>
            <Text style={styles.capText}>
              {currentCount} / {maxCap} Farmers
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(currentCount / maxCap) * 100}%` },
            ]}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#71717A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search farmer by name or local ID..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Registration Shortcuts */}
        <View style={styles.shortcutRow}>
          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => router.push('/(auth)/register')}
          >
            <UserPlus size={16} color="#16A34A" />
            <Text style={styles.shortcutText}>Register with Phone</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => router.push('/(auth)/register')}
          >
            <PhoneOff size={16} color="#C78326" />
            <Text style={styles.shortcutText}>Farmer Without Phone</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Farmers List */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {filteredFarmers.map((f) => (
          <VisualCard
            key={f.id}
            title={f.name}
            subtitle={`${f.local_id} • ${f.kebele} • ${f.plots_count} plots`}
            badge={f.status}
            badgeColor={f.status === 'APPROVED' ? '#16A34A' : '#C78326'}
            icon={
              f.has_phone ? (
                <Smartphone size={24} color="#16A34A" />
              ) : (
                <PhoneOff size={24} color="#C78326" />
              )
            }
            onPress={() => router.push(`/(da)/farmers/multi-farmer?farmerId=${f.id}` as any)}
          >
            <View style={styles.cardFooter}>
              <Text style={styles.phoneText}>
                {f.phone || 'Managed Profile (No Phone)'}
              </Text>
              <Text style={styles.actionPrompt}>Open Shared Session →</Text>
            </View>
          </VisualCard>
        ))}
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DFD9CB',
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#151A14',
  },
  capBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  capText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F0ECE1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF8F4',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#151A14',
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FAF8F4',
    borderWidth: 1,
    borderColor: '#DFD9CB',
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 56,
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#151A14',
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
  phoneText: {
    fontSize: 12,
    color: '#566153',
    fontWeight: '600',
  },
  actionPrompt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
});

