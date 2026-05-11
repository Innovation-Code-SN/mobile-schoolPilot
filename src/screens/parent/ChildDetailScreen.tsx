// src/screens/parent/ChildDetailScreen.tsx
// Détails de base d'un enfant + boutons d'accès aux écrans dédiés
// (santé, passages infirmerie, transport).
import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { parentApi } from '../../api/parentApi';
import { Badge, Card, ErrorView, Loader, Screen, SectionHeader } from '../../components/ui';
import type { ChildrenStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';
import { formatDate } from '../../utils/format';
import { childStatusLabel, childStatusTone } from '../../utils/status';

type DetailRoute = RouteProp<ChildrenStackParamList, 'ChildDetail'>;
type DetailNav = NavigationProp<ChildrenStackParamList>;

export function ChildDetailScreen() {
  const { params } = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNav>();
  const childId = params.childId;

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['parent', 'child', childId],
    queryFn: () => parentApi.getChildDetails(childId),
  });

  if (isLoading) {
    return (
      <Screen>
        <Loader label="Chargement…" />
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <ErrorView message={(error as Error)?.message} onRetry={() => refetch()} />
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <Card style={styles.hero}>
        <Text style={styles.name}>{data.fullName}</Text>
        <View style={styles.badgeRow}>
          <Badge
            label={childStatusLabel(data.academicInfo.status)}
            tone={childStatusTone(data.academicInfo.status)}
          />
          <Text style={styles.heroSub}>
            {data.gender === 'MALE' ? 'Garçon' : 'Fille'} • {data.age} ans
          </Text>
        </View>
      </Card>

      {/* Boutons d'accès rapides */}
      <View style={styles.shortcuts}>
        <ShortcutTile
          icon="medical"
          label="Santé"
          onPress={() =>
            navigation.navigate('MedicalProfile', {
              childId,
              childName: data.fullName,
            })
          }
        />
        <ShortcutTile
          icon="bandage"
          label="Passages infirmerie"
          onPress={() =>
            navigation.navigate('InfirmaryVisits', {
              childId,
              childName: data.fullName,
            })
          }
        />
        <ShortcutTile
          icon="bus"
          label="Transport"
          onPress={() =>
            navigation.navigate('Transport', {
              childId,
              childName: data.fullName,
            })
          }
        />
      </View>

      <SectionHeader title="Informations académiques" />
      <Card style={styles.card}>
        <Row label="Classe" value={data.academicInfo.currentClass ?? '—'} />
        <Row label="Niveau" value={data.academicInfo.currentLevel ?? '—'} />
        <Row label="Année scolaire" value={data.academicInfo.academicYear ?? '—'} last />
      </Card>

      <SectionHeader title="Informations personnelles" />
      <Card style={styles.card}>
        <Row label="Date de naissance" value={formatDate(data.dateOfBirth)} />
        <Row label="Nationalité" value={data.nationality ?? '—'} />
        <Row label="Relation" value={data.relationType ?? '—'} last />
      </Card>

      <SectionHeader title="Responsabilité" />
      <Card style={styles.card}>
        <Row label="Contact principal" value={data.isPrimaryContact ? 'Oui' : 'Non'} />
        <Row
          label="Responsable financier"
          value={data.isFinanciallyResponsible ? 'Oui' : 'Non'}
          last
        />
      </Card>
    </Screen>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ShortcutTile({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.shortcut, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.shortcutIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: spacing.lg, alignItems: 'center' },
  name: { ...typography.h2, color: colors.text },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  heroSub: { ...typography.caption, color: colors.textSecondary },

  shortcuts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  shortcut: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: { ...typography.small, color: colors.text, fontWeight: '600', textAlign: 'center' },

  card: { marginBottom: spacing.sm, padding: 0 },
  row: { flexDirection: 'row', padding: spacing.md, alignItems: 'center' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  rowValue: { ...typography.body, color: colors.text, flex: 1.4, textAlign: 'right' },
});
