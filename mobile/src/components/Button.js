import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline'
  size = 'medium', // 'small', 'medium', 'large'
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryBtn;
      case 'danger':
        return styles.dangerBtn;
      case 'outline':
        return styles.outlineBtn;
      case 'primary':
      default:
        return styles.primaryBtn;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'danger':
        return styles.dangerText;
      case 'outline':
        return styles.outlineText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24 };
      case 'medium':
      default:
        return { paddingVertical: 12, paddingHorizontal: 18 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        (disabled || loading) && styles.disabledBtn,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? COLORS.primary : COLORS.text}
        />
      ) : (
        <Text style={[styles.baseText, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  baseText: {
    fontWeight: '600',
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryBtn: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryText: {
    color: COLORS.text,
  },
  dangerBtn: {
    backgroundColor: COLORS.danger,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primary,
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
