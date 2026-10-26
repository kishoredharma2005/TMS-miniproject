import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

export const StatCard = ({ label, value, color = COLORS.primary, onPress, active = false }) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.card,
        { borderTopColor: color },
        active && { backgroundColor: COLORS.surfaceLight, borderColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.value, { color }]}>{value ?? 0}</Text>
      <Text style={styles.label}>{label}</Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 4,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
