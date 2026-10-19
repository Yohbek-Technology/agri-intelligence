import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';

export interface VisualCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeBackground?: string;
  onPress?: () => void;
  onAudioPress?: () => void;
  style?: ViewStyle;
  isAudioPlaying?: boolean;
}

export function VisualCard({
  title,
  value,
  subtitle,
  icon,
  badgeText,
  badgeColor = Colors.light.primary,
  badgeBackground = Colors.light.primarySubtle,
  onPress,
  onAudioPress,
  style,
  isAudioPlaying = false,
}: VisualCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        Shadows.card,
        pressed && styles.pressed,
        style,
      ]}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {onAudioPress ? (
          <Pressable
            onPress={onAudioPress}
            accessibilityLabel={`Read ${title} aloud`}
            accessibilityRole="button"
            style={[
              styles.audioButton,
              isAudioPlaying && styles.audioButtonPlaying,
            ]}>
            <Text style={styles.audioIcon}>{isAudioPlaying ? '🔊' : '🔈'}</Text>
          </Pressable>
        ) : null}
      </View>

      {value !== undefined ? (
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          {badgeText ? (
            <View style={[styles.badge, { backgroundColor: badgeBackground }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.four,
    marginVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.92,
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
  },
  icon: {
    fontSize: 28,
    marginRight: Spacing.three,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.half,
  },
  audioButton: {
    width: TouchTargets.minimum,
    height: TouchTargets.minimum,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.two,
  },
  audioButtonPlaying: {
    backgroundColor: Colors.light.primarySubtle,
  },
  audioIcon: {
    fontSize: 20,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radii.small,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
