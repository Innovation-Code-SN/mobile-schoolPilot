import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  description?: string;
}

interface SelectProps<T> {
  label?: string;
  value: T | undefined;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Sélectionner…',
  error,
  disabled,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        style={[
          styles.trigger,
          error ? styles.triggerError : null,
          disabled && styles.triggerDisabled,
        ]}
      >
        <Text style={[styles.value, !selected && styles.placeholder]}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label ?? 'Sélectionner'}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.option,
                      active && styles.optionActive,
                      pressed && styles.optionPressed,
                    ]}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                        {item.label}
                      </Text>
                      {item.description ? (
                        <Text style={styles.optionDesc}>{item.description}</Text>
                      ) : null}
                    </View>
                    {active ? (
                      <Ionicons name="checkmark" size={18} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.xs },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  triggerError: { borderColor: colors.danger },
  triggerDisabled: { opacity: 0.5 },
  value: { ...typography.body, color: colors.text, flex: 1 },
  placeholder: { color: colors.textMuted },
  error: { ...typography.small, color: colors.danger, marginTop: spacing.xs },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    minHeight: 220,
    paddingBottom: spacing.xl + 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: { ...typography.h3, color: colors.text },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionActive: { backgroundColor: colors.primaryLight },
  optionPressed: { backgroundColor: colors.surfaceAlt },
  optionLabel: { ...typography.body, color: colors.text },
  optionLabelActive: { color: colors.primary, fontWeight: '600' },
  optionDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
});
