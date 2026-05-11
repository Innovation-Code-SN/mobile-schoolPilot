import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface CheckboxProps {
  value: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Checkbox({ value, onChange, label, description, disabled }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => !disabled && onChange(!value)}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.box, value && styles.boxChecked]}>
        {value ? <Ionicons name="checkmark" size={14} color="#FFF" /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.desc}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginTop: 1,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...typography.body, color: colors.text },
  desc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
});
