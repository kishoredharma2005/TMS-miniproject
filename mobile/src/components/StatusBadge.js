import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { STATUS_COLORS } from '../utils/constants';
import { RADIUS } from '../utils/theme';

export const StatusBadge = ({ status = 'Pending', style, textStyle }) => {
  const config = STATUS_COLORS[status] || STATUS_COLORS.Pending;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: config.text }, textStyle]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
