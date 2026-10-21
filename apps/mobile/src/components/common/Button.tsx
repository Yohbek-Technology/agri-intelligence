import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type PressableProps,
} from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets, Shadows } from '@/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'normal' | 'large';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const isLarge = size === 'large';
  const minHeight = isLarge ? TouchTargets.primaryButton : TouchTargets.minimum;

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return Colors.light.border;
    switch (variant) {
      case 'primary':
        return pressed ? Colors.light.primaryHover : Colors.light.primary;
      case 'secondary':
        return pressed ? Colors.light.primary : Colors.light.secondary;
      case 'accent': // Terracotta Amber for Listen triggers
        return pressed ? '#D94700' : Colors.light.accent;
      case 'danger':
        return pressed ? '#B71C1C' : Colors.light.danger;
      case 'outline':
      case 'ghost':
        return pressed ? Colors.light.backgroundElement : 'transparent';
      default:
        return Colors.light.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.light.textMuted;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'accent':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
        return Colors.light.primary;
      case 'ghost':
        return Colors.light.text;
      default:
        return '#FFFFFF';
    }
  };

  const hasBorder = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight,
          backgroundColor: getBackgroundColor(pressed),
          borderColor: hasBorder ? Colors.light.primary : 'transparent',
          borderWidth: hasBorder ? 1.5 : 0,
        },
        variant !== 'ghost' && !disabled && Shadows.card,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' ? <>{icon}</> : null}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: isLarge ? 16 : 14 },
              textStyle,
            ]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' ? <>{icon}</> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radii.md,
    gap: Spacing.two,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
