import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing, Radii } from '@/theme/tokens';
import { useAuth } from '@/context/AuthContext';

export interface AppHeaderProps {
  locationName?: string; // e.g. "Adama • Kebele 03"
  activeFarmerName?: string | null;
  pendingSyncCount?: number;
  currentLanguage?: string;
  onLanguageToggle?: () => void;
  onFarmerSwitchPress?: () => void;
  onSyncChipPress?: () => void;
  onProfilePress?: () => void;
}

export function AppHeader({
  locationName = 'Adama • Kebele 03',
  activeFarmerName,
  pendingSyncCount = 0,
  currentLanguage = 'አማ',
  onLanguageToggle,
  onFarmerSwitchPress,
  onSyncChipPress,
  onProfilePress,
}: AppHeaderProps) {
  const { role } = useAuth();
  const isDa = role === 'da';

  return (
    <View style={styles.container}>
      {/* Top Bar: Brand, Location, Language & Profile */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Text style={styles.brandLogo}>🌿</Text>
          <View>
            <Text style={styles.brandTitle}>AgriIntel ET</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              📍 {locationName}
            </Text>
          </View>
        </View>

        <View style={styles.topActions}>
          {/* Language Switch Pill */}
          <Pressable
            onPress={onLanguageToggle}
            accessibilityRole="button"
            accessibilityLabel="Switch active language"
            style={styles.langPill}>
            <Text style={styles.langText}>{currentLanguage}/EN</Text>
          </Pressable>

          {/* Profile Circle with Online Indicator */}
          <Pressable
            onPress={onProfilePress}
            accessibilityRole="button"
            accessibilityLabel="User profile"
            style={styles.profileCircle}>
            <Text style={styles.profileEmoji}>👤</Text>
            <View style={styles.onlineDot} />
          </Pressable>
        </View>
      </View>

      {/* Sub-Bar: Sync Status Chip & DA Active Farmer Switcher */}
      <View style={styles.bottomRow}>
        {/* Sync Status Chip */}
        <Pressable
          onPress={onSyncChipPress}
          accessibilityLabel={`Sync status: ${pendingSyncCount} pending changes`}
          style={[
            styles.syncChip,
            pendingSyncCount > 0 ? styles.syncChipPending : styles.syncChipSynced,
          ]}>
          <View
            style={[
              styles.syncPulseDot,
              { backgroundColor: pendingSyncCount > 0 ? Colors.light.warningBorder : Colors.light.success },
            ]}
          />
          <Text style={styles.syncText}>
            {pendingSyncCount > 0 ? `Syncing • ${pendingSyncCount} pending` : 'Synced • 0 pending'}
          </Text>
        </Pressable>

        {/* DA Active Farmer Switcher (AGENT-1) */}
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
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandLogo: {
    fontSize: 28,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
    letterSpacing: -0.3,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  langPill: {
    height: 34,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  profileEmoji: {
    fontSize: 18,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.success,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.one,
  },
  syncChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 3,
    borderRadius: Radii.full,
    gap: 6,
  },
  syncChipSynced: {
    backgroundColor: Colors.light.successLight,
  },
  syncChipPending: {
    backgroundColor: Colors.light.warningLight,
  },
  syncPulseDot: {
    width: 7,
    height: 7,
    borderRadius: Radii.full,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.text,
  },
  daFarmerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.infoLight,
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.light.info,
    maxWidth: 160,
    gap: 4,
  },
  daIcon: {
    fontSize: 13,
  },
  daFarmerName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.info,
    flexShrink: 1,
  },
  dropdownArrow: {
    fontSize: 11,
    color: Colors.light.info,
  },
});
