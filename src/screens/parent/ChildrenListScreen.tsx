import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { parentApi } from '../../api/parentApi';
import { Badge, Card, EmptyState, ErrorView, Loader, Screen } from '../../components/ui';
import type { ChildrenStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { formatCurrency } from '../../utils/format';
import { childStatusLabel, childStatusTone } from '../../utils/status';

type Nav = NativeStackNavigationProp<ChildrenStackParamList, 'ChildrenList'>;

export function ChildrenListScreen() {
  const nav = useNavigation<Nav>();
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: parentApi.getChildren,
  });

  if (isLoading) {
    return (
      <Screen>
        <Loader label="Chargement des enfants…" />
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

  if (data.length === 0) {
    return (
      <Screen refreshing={isRefetching} onRefresh={refetch}>
        <EmptyState
          title="Aucun enfant rattaché"
          description="Les enfants liés à votre compte apparaîtront ici."
        />
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      {data.map((child) => (
        <Card
          key={child.id}
          style={styles.card}
          onPress={() =>
            nav.navigate('ChildDetail', { childId: child.id, childName: child.fullName })
          }
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{child.fullName}</Text>
              <Text style={styles.sub}>
                {child.currentClass ?? 'Sans classe'}
                {child.academicYear ? ` • ${child.academicYear}` : ''}
              </Text>
            </View>
            <Badge label={childStatusLabel(child.status)} tone={childStatusTone(child.status)} />
          </View>

          <View style={styles.infoRow}>
            <InfoItem label="Relation" value={child.relationType ?? '—'} />
            <InfoItem
              label="Solde dû"
              value={formatCurrency(child.totalDue - child.paidAmount)}
              highlight={child.unpaidInvoicesCount > 0}
            />
          </View>

          {child.unpaidInvoicesCount > 0 ? (
            <Text style={styles.warn}>
              {child.unpaidInvoicesCount} facture(s) impayée(s)
            </Text>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}

function InfoItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: colors.warning }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  name: { ...typography.bodyBold, color: colors.text },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row' },
  infoItem: { flex: 1 },
  infoLabel: { ...typography.small, color: colors.textMuted, textTransform: 'uppercase' },
  infoValue: { ...typography.bodyBold, color: colors.text, marginTop: 2 },
  warn: { ...typography.caption, color: colors.warning, marginTop: spacing.sm },
});
