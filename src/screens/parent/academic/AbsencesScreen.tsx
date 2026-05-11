import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { academicApi } from '../../../api/academicApi';
import { ChildSwitcher } from '../../../components/ChildSwitcher';
import {
  Badge,
  Card,
  EmptyState,
  ErrorView,
  Loader,
  Screen,
  SectionHeader,
  Select,
} from '../../../components/ui';
import { useSelectedChild } from '../../../contexts/SelectedChildContext';
import { colors, radius, spacing, typography } from '../../../theme';
import type { AbsenceParent, RetardParent } from '../../../types/academic';
import { formatDate } from '../../../utils/format';

type SubTab = 'absences' | 'retards';

export function AbsencesScreen() {
  const { selectedChild, children, isLoading: childrenLoading } = useSelectedChild();
  const eleveId = selectedChild?.id;
  const [subTab, setSubTab] = useState<SubTab>('absences');
  const [periodeId, setPeriodeId] = useState<number | undefined>();

  const periodesQuery = useQuery({
    queryKey: ['academic', 'periodes'],
    queryFn: academicApi.getPeriodes,
  });

  // Auto-sélection : période courante si dispo, sinon la première
  useEffect(() => {
    if (periodeId == null && periodesQuery.data && periodesQuery.data.length > 0) {
      const courante = periodesQuery.data.find((p) => p.estCourante);
      setPeriodeId(courante?.id ?? periodesQuery.data[0].id);
    }
  }, [periodeId, periodesQuery.data]);

  const absencesQuery = useQuery({
    queryKey: ['academic', 'absences', eleveId, periodeId],
    queryFn: () => academicApi.getAbsences(eleveId!, periodeId),
    enabled: !!eleveId,
  });

  const retardsQuery = useQuery({
    queryKey: ['academic', 'retards', eleveId, periodeId],
    queryFn: () => academicApi.getRetards(eleveId!, periodeId),
    enabled: !!eleveId,
  });

  const statsQuery = useQuery({
    queryKey: ['academic', 'stats-assiduite', eleveId, periodeId],
    queryFn: () => academicApi.getStatistiquesAssiduite(eleveId!, periodeId!),
    enabled: !!eleveId && !!periodeId,
  });

  const periodeOptions = useMemo(
    () =>
      (periodesQuery.data ?? []).map((p) => ({
        value: p.id,
        label: p.libelle,
        description: p.estCourante ? 'Période courante' : undefined,
      })),
    [periodesQuery.data]
  );

  if (childrenLoading) {
    return (
      <Screen>
        <Loader label="Chargement…" />
      </Screen>
    );
  }

  if (children.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Aucun enfant"
          description="Aucun enfant n'est rattaché à votre compte."
        />
      </Screen>
    );
  }

  const isRefreshing =
    absencesQuery.isRefetching || retardsQuery.isRefetching || statsQuery.isRefetching;
  const refreshAll = () => {
    absencesQuery.refetch();
    retardsQuery.refetch();
    statsQuery.refetch();
  };

  return (
    <Screen refreshing={isRefreshing} onRefresh={refreshAll}>
      <ChildSwitcher />
      <View style={{ height: spacing.md }} />

      <Select
        label="Période"
        value={periodeId}
        options={periodeOptions}
        onChange={(v) => setPeriodeId(v)}
        placeholder="Choisir une période…"
      />

      <View style={{ height: spacing.md }} />

      <StatsCard stats={statsQuery.data ?? null} loading={statsQuery.isLoading} />

      <View style={styles.tabs}>
        <SubTabButton
          active={subTab === 'absences'}
          label={`Absences${absencesQuery.data ? ` (${absencesQuery.data.length})` : ''}`}
          onPress={() => setSubTab('absences')}
        />
        <SubTabButton
          active={subTab === 'retards'}
          label={`Retards${retardsQuery.data ? ` (${retardsQuery.data.length})` : ''}`}
          onPress={() => setSubTab('retards')}
        />
      </View>

      {subTab === 'absences' ? (
        <AbsencesList query={absencesQuery} />
      ) : (
        <RetardsList query={retardsQuery} />
      )}
    </Screen>
  );
}

function SubTabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      {label}
    </Text>
  );
}

function StatsCard({
  stats,
  loading,
}: {
  stats: import('../../../types/academic').StatistiquesAssiduite | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card style={styles.statsCard}>
        <Loader label="Calcul des statistiques…" />
      </Card>
    );
  }
  if (!stats) {
    return null;
  }

  const tauxAbs = stats.tauxAbsenteisme ?? 0;

  return (
    <Card style={styles.statsCard}>
      <Text style={styles.statsTitle}>Assiduité de la période</Text>

      <View style={styles.statsGrid}>
        <StatBlock
          label="Absences"
          value={String(stats.nombreAbsences ?? 0)}
          color={colors.warning}
          icon="alert-circle-outline"
        />
        <StatBlock
          label="Justifiées"
          value={String(stats.nombreAbsencesJustifiees ?? 0)}
          color={colors.success}
          icon="checkmark-circle-outline"
        />
        <StatBlock
          label="Injustifiées"
          value={String(stats.nombreAbsencesInjustifiees ?? 0)}
          color={colors.danger}
          icon="close-circle-outline"
        />
        <StatBlock
          label="Retards"
          value={String(stats.nombreRetards ?? 0)}
          color={colors.info}
          icon="time-outline"
        />
      </View>

      {typeof stats.tauxAbsenteisme === 'number' ? (
        <View style={styles.tauxRow}>
          <Text style={styles.tauxLabel}>Taux d'absentéisme</Text>
          <View style={styles.tauxBarTrack}>
            <View
              style={[
                styles.tauxBarFill,
                {
                  width: `${Math.min(100, Math.max(0, tauxAbs))}%`,
                  backgroundColor:
                    tauxAbs > 15 ? colors.danger : tauxAbs > 5 ? colors.warning : colors.success,
                },
              ]}
            />
          </View>
          <Text style={styles.tauxValue}>{tauxAbs.toFixed(1)}%</Text>
        </View>
      ) : null}
    </Card>
  );
}

function StatBlock({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statBlock}>
      <View style={[styles.statIcon, { backgroundColor: color + '1A' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AbsencesList({
  query,
}: {
  query: ReturnType<typeof useQuery<AbsenceParent[]>>;
}) {
  if (query.isLoading) return <Loader label="Chargement…" />;
  if (query.isError)
    return (
      <ErrorView
        message={(query.error as Error)?.message}
        onRetry={query.refetch}
      />
    );
  if (!query.data || query.data.length === 0) {
    return (
      <EmptyState
        title="Aucune absence"
        description="Aucune absence enregistrée pour cette période."
      />
    );
  }
  return (
    <>
      <SectionHeader title="Historique des absences" />
      {query.data.map((a) => (
        <AbsenceCard key={a.id} absence={a} />
      ))}
    </>
  );
}

function AbsenceCard({ absence }: { absence: AbsenceParent }) {
  const dateLabel =
    absence.dateDebut && absence.dateFin && absence.dateDebut !== absence.dateFin
      ? `Du ${formatDate(absence.dateDebut)} au ${formatDate(absence.dateFin)}`
      : absence.dateDebut
      ? formatDate(absence.dateDebut)
      : '—';

  return (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{absence.typeAbsenceLibelle ?? 'Absence'}</Text>
          <Text style={styles.itemDate}>{dateLabel}</Text>
        </View>
        <Badge
          label={absence.estJustifiee ? 'Justifiée' : 'Non justifiée'}
          tone={absence.estJustifiee ? 'success' : 'danger'}
        />
      </View>

      {absence.heureDebut && absence.heureFin ? (
        <Text style={styles.itemHint}>
          De {absence.heureDebut.slice(0, 5)} à {absence.heureFin.slice(0, 5)}
        </Text>
      ) : null}

      {(absence.nombreJours ?? 0) > 0 || (absence.nombreHeures ?? 0) > 0 ? (
        <Text style={styles.itemHint}>
          Durée :{' '}
          {(absence.nombreJours ?? 0) > 0
            ? `${absence.nombreJours}j`
            : `${absence.nombreHeures}h`}
        </Text>
      ) : null}

      {absence.motif ? <Text style={styles.itemMotif}>« {absence.motif} »</Text> : null}

      <View style={styles.itemFooter}>
        {absence.justificatifDepose ? (
          <View style={styles.tag}>
            <Ionicons name="document-attach-outline" size={12} color={colors.success} />
            <Text style={[styles.tagText, { color: colors.success }]}>Justificatif déposé</Text>
          </View>
        ) : null}
        {absence.statutTraitementLibelle ? (
          <Text style={styles.itemMeta}>{absence.statutTraitementLibelle}</Text>
        ) : null}
      </View>
    </Card>
  );
}

function RetardsList({
  query,
}: {
  query: ReturnType<typeof useQuery<RetardParent[]>>;
}) {
  if (query.isLoading) return <Loader label="Chargement…" />;
  if (query.isError)
    return (
      <ErrorView
        message={(query.error as Error)?.message}
        onRetry={query.refetch}
      />
    );
  if (!query.data || query.data.length === 0) {
    return (
      <EmptyState
        title="Aucun retard"
        description="Aucun retard enregistré pour cette période."
      />
    );
  }
  return (
    <>
      <SectionHeader title="Historique des retards" />
      {query.data.map((r) => (
        <RetardCard key={r.id} retard={r} />
      ))}
    </>
  );
}

function RetardCard({ retard }: { retard: RetardParent }) {
  return (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>
            Retard de {retard.dureeRetardMinutes ?? '—'} min
          </Text>
          <Text style={styles.itemDate}>
            {retard.dateRetard ? formatDate(retard.dateRetard) : '—'}
          </Text>
        </View>
        <Badge
          label={retard.estJustifie ? 'Justifié' : 'Non justifié'}
          tone={retard.estJustifie ? 'success' : 'danger'}
        />
      </View>

      {retard.heurePrevue && retard.heureArrivee ? (
        <Text style={styles.itemHint}>
          Prévu à {retard.heurePrevue.slice(0, 5)} • Arrivé à {retard.heureArrivee.slice(0, 5)}
        </Text>
      ) : null}

      {retard.motif ? <Text style={styles.itemMotif}>« {retard.motif} »</Text> : null}

      <View style={styles.itemFooter}>
        {retard.justificatifDepose ? (
          <View style={styles.tag}>
            <Ionicons name="document-attach-outline" size={12} color={colors.success} />
            <Text style={[styles.tagText, { color: colors.success }]}>Justificatif déposé</Text>
          </View>
        ) : null}
        {retard.statutTraitementLibelle ? (
          <Text style={styles.itemMeta}>{retard.statutTraitementLibelle}</Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  statsCard: { marginBottom: spacing.md, padding: spacing.md },
  statsTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statBlock: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { ...typography.h3, color: colors.text },
  statLabel: { ...typography.small, color: colors.textSecondary, marginLeft: 2 },
  tauxRow: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tauxLabel: { ...typography.small, color: colors.textSecondary, flex: 1 },
  tauxBarTrack: {
    flex: 2,
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  tauxBarFill: { height: '100%', borderRadius: 3 },
  tauxValue: { ...typography.bodyBold, color: colors.text, minWidth: 48, textAlign: 'right' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    marginVertical: spacing.md,
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    ...typography.bodyBold,
    color: colors.textSecondary,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  tabActive: {
    backgroundColor: colors.surface,
    color: colors.text,
  },
  itemCard: { marginBottom: spacing.sm },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs },
  itemTitle: { ...typography.bodyBold, color: colors.text },
  itemDate: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  itemHint: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
  itemMotif: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  itemMeta: { ...typography.small, color: colors.textMuted },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagText: { ...typography.small, fontWeight: '600' },
});
