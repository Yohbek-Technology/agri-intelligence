import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing, Radii } from '@/theme/tokens';

export type StatusVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'go'
  | 'wait'
  | 'no';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  icon?: string;
  size?: 'small' | 'medium';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function StatusBadge({
  label,
  variant = 'neutral',
  icon,
  size = 'small',
  style,
  textStyle,
}: StatusBadgeProps) {
  const getColors = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case 'success':
      case 'go':
        return {
          bg: Colors.light.successLight,
          text: Colors.light.success,
          border: Colors.light.success,
        };
      case 'warning':
      case 'wait':
        return {
          bg: Colors.light.warningLight,
          text: Colors.light.warning,
          border: Colors.light.warningBorder,
        };
      case 'danger':
      case 'no':
        return {
          bg: Colors.light.dangerLight,
          text: Colors.light.danger,
          border: Colors.light.danger,
        };
      case 'info':
        return {
          bg: Colors.light.infoLight,
          text: Colors.light.info,
          border: Colors.light.info,
        };
      case 'neutral':
      default:
        return {
          bg: Colors.light.backgroundElement,
          text: Colors.light.textSecondary,
          border: Colors.light.border,
        };
    }
  };

  const colors = getColors();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? Spacing.two : Spacing.three,
        },
        style,
      ]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSmall ? 12 : 14,
            fontWeight: variant === 'go' || variant === 'wait' || variant === 'no' ? '800' : '700',
          },
          textStyle,
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: 4,
  },
  icon: {
    fontSize: 12,
  },
  text: {
    letterSpacing: 0.3,
  },
});
