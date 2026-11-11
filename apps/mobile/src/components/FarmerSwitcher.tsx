/**
 * FarmerSwitcher Component (M-31)
 * Modal picker enabling Development Agents on shared tablets to quickly switch
 * the active farmer context without full sign-out.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Search, UserCheck, X, Smartphone, PhoneOff } from 'lucide-react-native';
import { tokens } from '@/theme/tokens';

export interface FarmerItem {
  id: string;
  name: string;
  localId: string;
  kebele: string;
  hasPhone: boolean;
}

interface FarmerSwitcherProps {
  visible: boolean;
  farmers: FarmerItem[];
  activeFarmerId?: string;
  onSelectFarmer: (farmer: FarmerItem) => void;
  onClose: () => void;
}

export function FarmerSwitcher({
  visible,
  farmers,
  activeFarmerId,
  onSelectFarmer,
  onClose,
}: FarmerSwitcherProps) {
  const [query, setQuery] = useState('');

  const filtered = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.localId.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Switch Active Farmer</Text>
              <Text style={styles.subtitle}>Select farmer for this shared session</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityLabel="Close"
            >
              <X size={20} color="#71717A" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Search size={18} color="#71717A" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search farmer name or local ID..."
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {/* Farmer Roster */}
          <ScrollView style={styles.list}>
            {filtered.map((farmer) => {
              const isSelected = farmer.id === activeFarmerId;
              return (
                <TouchableOpacity
                  key={farmer.id}
                  style={[styles.farmerRow, isSelected && styles.farmerRowSelected]}
                  onPress={() => {
                    onSelectFarmer(farmer);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatar}>
                    <UserCheck size={20} color={isSelected ? '#FFFFFF' : '#16A34A'} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{farmer.name}</Text>
                    <Text style={styles.sub}>
                      {farmer.localId} • {farmer.kebele}
                    </Text>
                  </View>
                  {farmer.hasPhone ? (
                    <Smartphone size={18} color="#16A34A" />
                  ) : (
                    <PhoneOff size={18} color="#C78326" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A14',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    width: tokens.touchTarget.min,
    height: tokens.touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
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
    height: tokens.touchTarget.min,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#151A14',
  },
  list: {
    maxHeight: 320,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0ECE1',
    backgroundColor: '#FAF8F4',
    minHeight: tokens.touchTarget.min,
    gap: 12,
  },
  farmerRowSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
  },
  sub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
});

