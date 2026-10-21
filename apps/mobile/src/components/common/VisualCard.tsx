import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';
import { StatusBadge, type StatusVariant } from './StatusBadge';

export interface VisualCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: string | React.ReactNode;
  badgeLabel?: string;
  badgeText?: string;
  badgeVariant?: StatusVariant;
  badgeColor?: string;
  badgeBackground?: string;
  accentBorderColor?: string; // Solid colored left border (Stitch Level 2)
  onPress?: () => void;
  onAudioPress?: () => void;
  audioLabel?: string; // e.g. "አዳምጥ (Listen)"
  isAudioPlaying?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function VisualCard({
  title,
  subtitle,
  value,
  icon,
  badgeLabel,
  badgeText,
  badgeVariant,
  badgeColor,
  badgeBackground,
  accentBorderColor,
  onPress,
  onAudioPress,
  audioLabel,
  isAudioPlaying = false,
  style,
  children,
}: VisualCardProps) {
  const displayBadgeText = badgeLabel || badgeText;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        Shadows.card,
        accentBorderColor ? { borderLeftColor: accentBorderColor, borderLeftWidth: 4 } : null,
        pressed && styles.pressed,
        style,
      ]}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          {icon ? (
            typeof icon === 'string' ? (
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>{icon}</Text>
              </View>
            ) : (
              <View style={styles.iconCircle}>{icon}</View>
            )
          ) : null}

          <View style={styles.textContainer}>
            <View style={styles.headlineRow}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {displayBadgeText ? (
                badgeColor || badgeBackground ? (
                  <View
                    style={[
                      styles.customBadge,
                      {
                        backgroundColor: badgeBackground || Colors.light.backgroundElement,
                        borderColor: badgeColor || Colors.light.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.customBadgeText,
                        { color: badgeColor || Colors.light.text },
                      ]}>
                      {displayBadgeText}
                    </Text>
                  </View>
                ) : (
                  <StatusBadge
                    label={displayBadgeText}
                    variant={badgeVariant || 'neutral'}
                    size="small"
                  />
                )
              ) : null}
            </View>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Audio Listen Button */}
        {onAudioPress ? (
          <Pressable
            onPress={onAudioPress}
            accessibilityLabel={`Read ${title} aloud`}
            accessibilityRole="button"
            style={[
              audioLabel ? styles.audioPill : styles.audioCircle,
              isAudioPlaying && styles.audioPlaying,
            ]}>
            <Text style={styles.audioIcon}>{isAudioPlaying ? '🔊' : '🔈'}</Text>
            {audioLabel ? (
              <Text style={styles.audioLabelText}>
                {isAudioPlaying ? 'Playing' : audioLabel}
              </Text>
            ) : null}
          </Pressable>
        ) : null}
      </View>

      {/* Main Metric Value if supplied */}
      {value !== undefined ? (
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
        </View>
      ) : null}

      {/* Child Content (Checklists, progress bars, etc.) */}
      {children ? <View style={styles.childrenContainer}>{children}</View> : null}
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
    marginVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.three,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 19,
  },
  customBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  customBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  audioCircle: {
    width: TouchTargets.minimum,
    height: TouchTargets.minimum,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.accentLight,
    borderColor: Colors.light.accentBorder,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.two,
  },
  audioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TouchTargets.listenPill,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.accentLight,
    borderColor: Colors.light.accentBorder,
    borderWidth: 1,
    gap: 6,
    marginLeft: Spacing.two,
  },
  audioPlaying: {
    backgroundColor: Colors.light.accent,
  },
  audioIcon: {
    fontSize: 16,
  },
  audioLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.accent,
  },
  valueRow: {
    marginTop: Spacing.three,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
  },
  childrenContainer: {
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderSubtle,
  },
});
