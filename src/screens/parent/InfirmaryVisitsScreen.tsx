// src/screens/parent/InfirmaryVisitsScreen.tsx
// Liste des passages à l'infirmerie d'un enfant (lecture seule).
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { medicalApi } from '../../api/medicalApi';
import {
  Badge,
  Card,
  EmptyState,
  ErrorView,
  Loader,
  Screen,
  SectionHeader,
} from '../../components/ui';
import type { ChildrenStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import {
  VISIT_DECISION_DEFAULT_LABELS,
  VISIT_REASON_DEFAULT_LABELS,
} from '../../types/infirmary';

type Route = RouteProp<ChildrenStackParamList, 'InfirmaryVisits'>;

const formatDateTime = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const decisionTone = (decision: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  switch (decision) {
    case 'RETURNED_TO_CLASS':
    case 'SENT_HOME':
      return 'success';
    case 'REST_AT_INFIRMARY':
      return 'warning';
    case 'PARENT_CALLED':
    case 'EVACUATED':
      return 'danger';
    default:
      return 'neutral';
  }
};

export function InfirmaryVisitsScreen() {
  const { params } = useRoute<Route>();
  const childId = params.childId;

  const query = useQuery({
    queryKey: ['parent', 'infirmary-visits', childId],
    queryFn: () => medicalApi.getChildInfirmaryVisits(childId),
  });

  if (query.isLoading) {
    return (
      <Screen>
        <Loader label="Chargement des passages…" />
      </Screen>
    );
  }

  if (query.isError) {
    return (
      <Screen>
        <ErrorView
          message={(query.error as Error)?.message ?? 'Impossible de charger les passages'}
          onRetry={query.refetch}
        />
      </Screen>
    );
  }

  const visits = query.data ?? [];

  return (
    <Screen refreshing={query.isRefetching} onRefresh={query.refetch}>
      <SectionHeader
        title={`Passages à l'infirmerie (${visits.length})`}
        subtitle={params.childName}
      />

      {visits.length === 0 ? (
        <EmptyState
          title="Aucun passage"
          description="Aucun passage à l'infirmerie n'a encore été enregistré pour cet enfant."
        />
      ) : (
        visits.map((v) => {
          const reasonLabel = v.reasonLabel ?? VISIT_REASON_DEFAULT_LABELS[v.reason] ?? v.reason;
          const decisionLabel = v.decisionLabel ?? VISIT_DECISION_DEFAULT_LABELS[v.decision] ?? v.decision;
          const isEvacuation = v.decision === 'EVACUATED';
          const isUrgent = isEvacuation || v.decision === 'PARENT_CALLED';

          return (
            <Card key={v.id} style={isUrgent ? { ...styles.card, ...styles.cardUrgent } : styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.dateText}>{formatDateTime(v.entryAt)}</Text>
                <Badge label={decisionLabel} tone={decisionTone(v.decision)} />
              </View>

              <View style={styles.badgeRow}>
                <Badge label={reasonLabel} tone="neutral" />
                {v.parentNotified && <Badge label="📩 Parent notifié" tone="info" />}
              </View>

              {v.reasonDetails && (
                <Row label="Motif détaillé" value={v.reasonDetails} />
              )}
              {v.symptoms && <Row label="Symptômes" value={v.symptoms} />}
              {v.careProvided && <Row label="Soins" value={v.careProvided} />}
              {v.medicationsAdministered && (
                <Row label="Médicaments" value={v.medicationsAdministered} />
              )}

              {/* Section évacuation si applicable */}
              {isEvacuation && (
                <View style={styles.evacBox}>
                  <Text style={styles.evacTitle}>🚑 Évacuation</Text>
                  {(v.evacuationFacilityName || v.evacuationFacilityText) && (
                    <Row
                      label="Établissement"
                      value={v.evacuationFacilityName ?? v.evacuationFacilityText}
                    />
                  )}
                  {v.evacuationContactName && (
                    <Row label="Contact" value={v.evacuationContactName} />
                  )}
                  {v.evacuationContactPhone && (
                    <Row label="Téléphone" value={v.evacuationContactPhone} />
                  )}
                  {v.evacuationDepartedAt && (
                    <Row label="Départ" value={formatDateTime(v.evacuationDepartedAt)} />
                  )}
                  {v.evacuationNotes && (
                    <Row label="Notes" value={v.evacuationNotes} />
                  )}
                </View>
              )}

              {v.handledByName && (
                <Text style={styles.footerText}>Pris en charge par {v.handledByName}</Text>
              )}
              {v.notes && <Text style={styles.notes}>{v.notes}</Text>}
            </Card>
          );
        })
      )}

      <View style={{ height: spacing.lg }} />
    </Screen>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label} :</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm, padding: spacing.md },
  cardUrgent: { borderLeftWidth: 4, borderLeftColor: colors.danger },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateText: { ...typography.bodyBold, color: colors.text },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', marginTop: spacing.xs, gap: spacing.xs },
  rowLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  rowValue: { ...typography.caption, color: colors.text, flex: 1 },
  evacBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.dangerBg,
    borderRadius: 6,
  },
  evacTitle: {
    ...typography.bodyBold,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  footerText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  notes: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 6,
  },
});
