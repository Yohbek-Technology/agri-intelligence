import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { useAuth } from '@/context/AuthContext';

export interface AppHeaderProps {
  activeFarmerName?: string | null;
  pendingSyncCount?: number;
  onFarmerSwitchPress?: () => void;
  onSyncChipPress?: () => void;
}

export function AppHeader({
  activeFarmerName,
  pendingSyncCount = 0,
  onFarmerSwitchPress,
  onSyncChipPress,
}: AppHeaderProps) {
  const { role } = useAuth();
  const isDa = role === 'da';

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <Text style={styles.brandEmoji}>🌿</Text>
        <View>
          <Text style={styles.brandTitle}>Agri Intelligence</Text>
          <Text style={styles.brandSubtitle}>Ethiopian Extension System</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {/* Sync Status Chip (SYNC-8) */}
        <Pressable
          onPress={onSyncChipPress}
          accessibilityLabel={`Sync status: ${pendingSyncCount} pending changes`}
          style={[
            styles.syncChip,
            pendingSyncCount > 0 ? styles.syncChipPending : styles.syncChipSynced,
          ]}>
          <Text style={styles.syncDot}>
            {pendingSyncCount > 0 ? '🔄' : '✅'}
          </Text>
          <Text style={styles.syncText}>
            {pendingSyncCount > 0 ? `${pendingSyncCount} pending` : 'Synced'}
          </Text>
        </Pressable>

        {/* DA Active Farmer Switcher Badge (AGENT-1) */}
        {isDa ? (
          <Pressable
            onPress={onFarmerSwitchPress}
            accessibilityLabel={`Active farmer: ${activeFarmerName || 'Select Farmer'}`}
            style={styles.daFarmerBadge}>
            <Text style={styles.daIcon}>👨‍🌾</Text>
            <Text style={styles.daFarmerName} numberOfLines={1}>
              {activeFarmerName || 'Select Farmer'}
            </Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandEmoji: {
    fontSize: 26,
    marginRight: Spacing.two,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },
  brandSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  syncChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  syncChipSynced: {
    backgroundColor: Colors.light.primarySubtle,
    borderColor: Colors.light.primary,
  },
  syncChipPending: {
    backgroundColor: Colors.light.warningLight,
    borderColor: Colors.light.warning,
  },
  syncDot: {
    fontSize: 12,
    marginRight: Spacing.one,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.text,
  },
  daFarmerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.infoLight,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.light.info,
    maxWidth: 130,
  },
  daIcon: {
    fontSize: 13,
    marginRight: Spacing.one,
  },
  daFarmerName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.info,
    flexShrink: 1,
  },
  dropdownArrow: {
    fontSize: 11,
    color: Colors.light.info,
    marginLeft: 2,
  },
});
