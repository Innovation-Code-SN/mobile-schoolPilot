import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

interface BadgeProps {
  label: string;
  tone?: Tone;
}

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.surfaceAlt, fg: colors.textSecondary },
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  info: { bg: colors.infoBg, fg: colors.info },
  primary: { bg: colors.primaryLight, fg: colors.primary },
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const t = toneStyles[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.label, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  label: { ...typography.small, fontWeight: '600' },
});
