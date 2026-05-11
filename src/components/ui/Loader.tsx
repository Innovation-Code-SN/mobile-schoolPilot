import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export function Loader({ label, fullScreen = false }: LoaderProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  fullScreen: { flex: 1, backgroundColor: colors.background },
  label: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
});
