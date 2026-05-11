import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { formatDate } from '../../utils/format';

interface DateFieldProps {
  label?: string;
  value?: string; // ISO yyyy-mm-dd
  onChange: (isoDate: string) => void;
  error?: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DateField({
  label,
  value,
  onChange,
  error,
  placeholder = 'Sélectionner une date',
  maximumDate,
  minimumDate,
}: DateFieldProps) {
  const [show, setShow] = useState(false);
  const parsed = value ? new Date(value) : new Date();

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (event.type === 'set' && selected) {
      onChange(toIsoDate(selected));
    }
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => setShow(true)}
        style={[styles.trigger, error ? styles.triggerError : null]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {show && (
        <DateTimePicker
          value={parsed}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          locale="fr-FR"
          themeVariant="light"
          textColor={colors.text}
          accentColor={colors.primary}
        />
      )}

      {Platform.OS === 'ios' && show ? (
        <Pressable style={styles.iosClose} onPress={() => setShow(false)}>
          <Text style={styles.iosCloseText}>Terminer</Text>
        </Pressable>
      ) : null}
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
  value: { ...typography.body, color: colors.text, flex: 1 },
  placeholder: { color: colors.textMuted },
  error: { ...typography.small, color: colors.danger, marginTop: spacing.xs },
  iosClose: { alignSelf: 'flex-end', padding: spacing.sm },
  iosCloseText: { ...typography.bodyBold, color: colors.primary },
});
