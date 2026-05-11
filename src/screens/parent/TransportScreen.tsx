// src/screens/parent/TransportScreen.tsx
// Affichage transport pour un enfant côté parent.
// - Affectation : ligne, arrêt, horaires
// - Véhicule : immatriculation, marque, couleur
// - Chauffeur + surveillant (avec téléphone)
// - Statistiques de présence (résumé)
// - Statut actuel du bus si voyage en cours
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { transportApi } from '../../api/transportApi';
import { useAuth } from '../../contexts/AuthContext';
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

type Route = RouteProp<ChildrenStackParamList, 'Transport'>;

export function TransportScreen() {
  const { params } = useRoute<Route>();
  const childId = params.childId;
  const { user } = useAuth();
  const parentUserId = user?.id;

  const transportQuery = useQuery({
    queryKey: ['parent', 'transport', childId, parentUserId],
    queryFn: () => transportApi.getChild(parentUserId!, childId),
    enabled: !!parentUserId,
  });

  const summaryQuery = useQuery({
    queryKey: ['parent', 'transport', 'attendance-summary', childId, parentUserId],
    queryFn: () => transportApi.getAttendanceSummary(parentUserId!, childId),
    enabled: !!parentUserId,
  });

  if (transportQuery.isLoading) {
    return (
      <Screen>
        <Loader label="Chargement…" />
      </Screen>
    );
  }

  if (transportQuery.isError) {
    return (
      <Screen>
        <ErrorView
          message={(transportQuery.error as Error)?.message ?? 'Impossible de charger le transport'}
          onRetry={transportQuery.refetch}
        />
      </Screen>
    );
  }

  const data = transportQuery.data;

  if (!data || !data.assignmentId) {
    return (
      <Screen>
        <EmptyState
          title="Pas de transport"
          description="Cet enfant n'est pas affecté à une ligne de transport scolaire."
        />
      </Screen>
    );
  }

  const summary = summaryQuery.data;

  return (
    <Screen refreshing={transportQuery.isRefetching} onRefresh={transportQuery.refetch}>
      {/* Statut actuel du bus */}
      {data.busInProgress && (
        <Card style={{ ...styles.card, ...styles.statusCard }}>
          <Text style={styles.statusTitle}>🚌 Bus en route</Text>
          {data.currentTripStatus && (
            <Text style={styles.statusText}>{data.currentTripStatus}</Text>
          )}
          {data.estimatedArrivalMinutes != null && (
            <Text style={styles.etaText}>
              Arrivée estimée : {data.estimatedArrivalMinutes} min
            </Text>
          )}
        </Card>
      )}

      {/* Ligne et arrêt */}
      <SectionHeader title="Ma ligne" />
      <Card style={styles.card}>
        <Row label="Ligne" value={data.routeName ?? '—'} />
        {data.routeCode && <Row label="Code" value={data.routeCode} />}
        <Row label="Arrêt" value={data.stopName ?? '—'} />
        {data.stopAddress && <Row label="Adresse" value={data.stopAddress} />}
        <Row label="Heure montée" value={data.morningPickupTime?.substring(0, 5) ?? '—'} />
        <Row label="Heure descente" value={data.afternoonDropoffTime?.substring(0, 5) ?? '—'} />
        <View style={styles.servicesRow}>
          {data.usesMorningTransport && <Badge label="Matin" tone="success" />}
          {data.usesAfternoonTransport && <Badge label="Après-midi" tone="success" />}
        </View>
      </Card>

      {/* Véhicule */}
      {(data.vehicleRegistration || data.vehicleBrand) && (
        <>
          <SectionHeader title="Véhicule" />
          <Card style={styles.card}>
            {data.vehicleRegistration && <Row label="Immatriculation" value={data.vehicleRegistration} />}
            {data.vehicleBrand && <Row label="Marque" value={data.vehicleBrand} />}
            {data.vehicleColor && <Row label="Couleur" value={data.vehicleColor} />}
          </Card>
        </>
      )}

      {/* Chauffeur */}
      {(data.driverName || data.driverPhone) && (
        <>
          <SectionHeader title="Chauffeur" />
          <Card style={styles.card}>
            {data.driverName && <Row label="Nom" value={data.driverName} />}
            {data.driverPhone && (
              <Pressable onPress={() => data.driverPhone && Linking.openURL(`tel:${data.driverPhone}`)}>
                <Row label="Téléphone" value={data.driverPhone} link />
              </Pressable>
            )}
          </Card>
        </>
      )}

      {/* Surveillant */}
      {(data.supervisorName || data.supervisorPhone) && (
        <>
          <SectionHeader title="Surveillant" />
          <Card style={styles.card}>
            {data.supervisorName && <Row label="Nom" value={data.supervisorName} />}
            {data.supervisorPhone && (
              <Pressable onPress={() => data.supervisorPhone && Linking.openURL(`tel:${data.supervisorPhone}`)}>
                <Row label="Téléphone" value={data.supervisorPhone} link />
              </Pressable>
            )}
          </Card>
        </>
      )}

      {/* Statistiques de présence */}
      <SectionHeader title="Présences (dernier mois)" />
      {summaryQuery.isLoading ? (
        <Loader label="Chargement des stats…" />
      ) : summary ? (
        <Card style={styles.card}>
          <View style={styles.statsRow}>
            <StatBox
              label="Taux présence"
              value={summary.attendanceRate != null ? `${summary.attendanceRate.toFixed(0)}%` : '—'}
              tone={getAttendanceTone(summary.attendanceRate)}
            />
            <StatBox
              label="Trajets totaux"
              value={summary.totalTrips?.toString() ?? '—'}
            />
            <StatBox
              label="Présences"
              value={summary.presentCount?.toString() ?? '0'}
              tone="success"
            />
            <StatBox
              label="Absences"
              value={summary.absentCount?.toString() ?? '0'}
              tone="danger"
            />
          </View>
          {summary.hasAttendanceIssue && summary.attendanceIssueMessage && (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>⚠️ {summary.attendanceIssueMessage}</Text>
            </View>
          )}
          {summary.trendDescription && (
            <Text style={styles.trendText}>📊 {summary.trendDescription}</Text>
          )}
        </Card>
      ) : null}

      {data.specialInstructions && (
        <>
          <SectionHeader title="Instructions spéciales" />
          <Card style={styles.card}>
            <Text style={styles.notes}>{data.specialInstructions}</Text>
          </Card>
        </>
      )}

      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}

// --- Sous-composants ---

function Row({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, link && styles.rowLink]}>{value}</Text>
    </View>
  );
}

function StatBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'success' | 'danger' | 'warning';
}) {
  return (
    <View style={styles.statBox}>
      <Text
        style={[
          styles.statValue,
          tone === 'success' && { color: colors.success },
          tone === 'danger' && { color: colors.danger },
          tone === 'warning' && { color: colors.warning },
        ]}
      >
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getAttendanceTone(rate?: number): 'success' | 'warning' | 'danger' | undefined {
  if (rate == null) return undefined;
  if (rate >= 90) return 'success';
  if (rate >= 70) return 'warning';
  return 'danger';
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm, padding: spacing.md },
  statusCard: {
    backgroundColor: colors.successBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  statusTitle: { ...typography.h3, color: colors.success },
  statusText: { ...typography.body, color: colors.text, marginTop: spacing.xs },
  etaText: { ...typography.bodyBold, color: colors.success, marginTop: spacing.xs },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  rowLabel: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  rowValue: { ...typography.body, color: colors.text, flex: 1.4, textAlign: 'right' },
  rowLink: { color: colors.primary, textDecorationLine: 'underline' },
  servicesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    flexBasis: '47%',
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: { ...typography.h2, color: colors.text },
  statLabel: { ...typography.small, color: colors.textSecondary, marginTop: spacing.xs },
  alertBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.warningBg,
    borderRadius: 6,
  },
  alertText: { ...typography.caption, color: colors.warning },
  trendText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  notes: { ...typography.body, color: colors.text, lineHeight: 22 },
});
