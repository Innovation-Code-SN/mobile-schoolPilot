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
import { useSelectedChild } from '../contexts/SelectedChildContext';
import { colors, radius, spacing, typography } from '../theme';
import { initials } from '../utils/format';

export function ChildSwitcher() {
  const { children, selectedChild, selectChild } = useSelectedChild();
  const [open, setOpen] = useState(false);

  if (children.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aucun enfant rattaché</Text>
      </View>
    );
  }

  if (children.length === 1) {
    return (
      <View style={styles.solo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials(selectedChild?.firstName, selectedChild?.lastName)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{selectedChild?.fullName ?? '—'}</Text>
          {selectedChild?.currentClass ? (
            <Text style={styles.sub}>{selectedChild.currentClass}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials(selectedChild?.firstName, selectedChild?.lastName)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{selectedChild?.fullName ?? 'Choisir un enfant'}</Text>
          {selectedChild?.currentClass ? (
            <Text style={styles.sub}>{selectedChild.currentClass}</Text>
          ) : null}
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choisir un enfant</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={children}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const active = selectedChild?.id === item.id;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.option,
                      active && styles.optionActive,
                      pressed && styles.optionPressed,
                    ]}
                    onPress={() => {
                      selectChild(item.id);
                      setOpen(false);
                    }}
                  >
                    <View style={styles.avatarSmall}>
                      <Text style={styles.avatarText}>
                        {initials(item.firstName, item.lastName)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionLabel}>{item.fullName}</Text>
                      <Text style={styles.optionSub}>
                        {item.currentClass ?? 'Sans classe'}
                        {item.academicYear ? ` • ${item.academicYear}` : ''}
                      </Text>
                    </View>
                    {active ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  emptyText: { ...typography.caption, color: colors.textSecondary },
  solo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.bodyBold, color: '#FFF' },
  name: { ...typography.bodyBold, color: colors.text },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
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
    gap: spacing.md,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionActive: { backgroundColor: colors.primaryLight },
  optionPressed: { backgroundColor: colors.surfaceAlt },
  optionLabel: { ...typography.body, color: colors.text },
  optionSub: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
});
