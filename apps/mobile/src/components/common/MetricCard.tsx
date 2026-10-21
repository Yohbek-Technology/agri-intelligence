import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';
import { StatusBadge, type StatusVariant } from './StatusBadge';

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  secondaryValue?: string; // e.g. "0.5 Ha"
  badgeLabel?: string;
  badgeVariant?: StatusVariant;
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  onAudioPress?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
}

export function MetricCard({
  label,
  value,
  unit,
  secondaryValue,
  badgeLabel,
  badgeVariant = 'neutral',
  trendText,
  trendDirection = 'neutral',
  onAudioPress,
  onPress,
  style,
}: MetricCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        Shadows.card,
        pressed && styles.pressed,
        style,
      ]}>
      {/* Header: Label and Audio Listen Trigger */}
      <View style={styles.headerRow}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {onAudioPress ? (
          <Pressable
            onPress={onAudioPress}
            accessibilityRole="button"
            accessibilityLabel={`Read ${label} value aloud`}
            style={styles.audioButton}>
            <Text style={styles.audioIcon}>🔊</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Main Metric Value & Unit */}
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>

      {/* Footer: Secondary dual-unit display or Trend / Status Badge */}
      <View style={styles.footerRow}>
        {secondaryValue ? (
          <Text style={styles.secondaryValue}>{secondaryValue}</Text>
        ) : (
          <View />
        )}

        {badgeLabel ? (
          <StatusBadge label={badgeLabel} variant={badgeVariant} size="small" />
        ) : trendText ? (
          <View style={styles.trendRow}>
            <Text style={styles.trendIcon}>
              {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→'}
            </Text>
            <Text
              style={[
                styles.trendText,
                {
                  color:
                    trendDirection === 'up'
                      ? Colors.light.success
                      : trendDirection === 'down'
                        ? Colors.light.danger
                        : Colors.light.textSecondary,
                },
              ]}>
              {trendText}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    padding: Spacing.four,
    marginVertical: Spacing.one,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    flex: 1,
  },
  audioButton: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIcon: {
    fontSize: 16,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
    marginVertical: Spacing.one,
  },
  value: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  secondaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textMuted,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendIcon: {
    fontSize: 14,
    fontWeight: '800',
  },
  trendText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
