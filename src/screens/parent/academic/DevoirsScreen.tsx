import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
} from '../../../components/ui';
import { useSelectedChild } from '../../../contexts/SelectedChildContext';
import { colors, radius, spacing, typography } from '../../../theme';
import type { DevoirParent } from '../../../types/academic';
import { formatDate } from '../../../utils/format';

type Filter = 'all' | 'upcoming' | 'late' | 'done';

export function DevoirsScreen() {
  const { selectedChild, children, isLoading: childrenLoading } = useSelectedChild();
  const eleveId = selectedChild?.id;
  const [filter, setFilter] = useState<Filter>('upcoming');

  const query = useQuery({
    queryKey: ['academic', 'devoirs', eleveId],
    queryFn: () => academicApi.getDevoirs(eleveId!),
    enabled: !!eleveId,
  });

  const stats = useMemo(() => {
    const data = query.data ?? [];
    let upcoming = 0;
    let late = 0;
    let done = 0;
    for (const d of data) {
      const statut = (d.statutRenduLibelle ?? '').toLowerCase();
      const isDone = statut.includes('rendu') && !statut.includes('non');
      if (isDone) done += 1;
      else if (d.estEnRetard) late += 1;
      else upcoming += 1;
    }
    return { all: data.length, upcoming, late, done };
  }, [query.data]);

  const filtered = useMemo(() => {
    const data = query.data ?? [];
    return data.filter((d) => {
      const statut = (d.statutRenduLibelle ?? '').toLowerCase();
      const isDone = statut.includes('rendu') && !statut.includes('non');
      switch (filter) {
        case 'upcoming':
          return !isDone && !d.estEnRetard;
        case 'late':
          return !isDone && d.estEnRetard;
        case 'done':
          return isDone;
        default:
          return true;
      }
    });
  }, [query.data, filter]);

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

  return (
    <Screen refreshing={query.isRefetching} onRefresh={query.refetch}>
      <ChildSwitcher />
      <View style={{ height: spacing.md }} />

      <View style={styles.chipsRow}>
        <FilterChip
          active={filter === 'upcoming'}
          label="À venir"
          count={stats.upcoming}
          onPress={() => setFilter('upcoming')}
          tone="primary"
        />
        <FilterChip
          active={filter === 'late'}
          label="En retard"
          count={stats.late}
          onPress={() => setFilter('late')}
          tone="danger"
        />
        <FilterChip
          active={filter === 'done'}
          label="Rendus"
          count={stats.done}
          onPress={() => setFilter('done')}
          tone="success"
        />
        <FilterChip
          active={filter === 'all'}
          label="Tous"
          count={stats.all}
          onPress={() => setFilter('all')}
        />
      </View>

      {query.isLoading ? (
        <Loader label="Chargement des devoirs…" />
      ) : query.isError ? (
        <ErrorView message={(query.error as Error)?.message} onRetry={query.refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun devoir"
          description={
            filter === 'all'
              ? "Aucun devoir n'a été attribué pour cet enfant."
              : 'Aucun devoir ne correspond à ce filtre.'
          }
        />
      ) : (
        <>
          <SectionHeader
            title={`${filtered.length} devoir${filtered.length > 1 ? 's' : ''}`}
            subtitle={selectedChild?.fullName}
          />
          {filtered.map((d) => (
            <DevoirCard key={d.id} devoir={d} />
          ))}
        </>
      )}
    </Screen>
  );
}

function FilterChip({
  active,
  label,
  count,
  onPress,
  tone,
}: {
  active: boolean;
  label: string;
  count: number;
  onPress: () => void;
  tone?: 'primary' | 'danger' | 'success';
}) {
  const activeColor =
    tone === 'danger'
      ? colors.danger
      : tone === 'success'
      ? colors.success
      : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: activeColor, borderColor: activeColor },
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label} · {count}
      </Text>
    </Pressable>
  );
}

function DevoirCard({ devoir }: { devoir: DevoirParent }) {
  const statut = (devoir.statutRenduLibelle ?? '').toLowerCase();
  const isDone = statut.includes('rendu') && !statut.includes('non');
  const jours = devoir.joursRestants;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View
          style={[
            styles.matiereDot,
            devoir.matiereCouleur
              ? { backgroundColor: devoir.matiereCouleur }
              : { backgroundColor: colors.primary },
          ]}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.matiere}>{devoir.matiereLibelle ?? '—'}</Text>
          {devoir.typeDevoirLibelle ? (
            <Text style={styles.subtitle}>{devoir.typeDevoirLibelle}</Text>
          ) : null}
        </View>
        {isDone ? (
          <Badge label={devoir.statutRenduLibelle ?? 'Rendu'} tone="success" />
        ) : devoir.estEnRetard ? (
          <Badge label="En retard" tone="danger" />
        ) : devoir.statutRenduLibelle ? (
          <Badge label={devoir.statutRenduLibelle} tone="warning" />
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {devoir.titre ?? 'Devoir'}
      </Text>

      {devoir.description ? (
        <Text style={styles.description} numberOfLines={3}>
          {devoir.description}
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        {devoir.dateEcheance ? (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>Échéance {formatDate(devoir.dateEcheance)}</Text>
          </View>
        ) : null}
        {typeof jours === 'number' && !isDone ? (
          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={14}
              color={jours < 0 ? colors.danger : jours <= 2 ? colors.warning : colors.textSecondary}
            />
            <Text
              style={[
                styles.metaText,
                {
                  color:
                    jours < 0
                      ? colors.danger
                      : jours <= 2
                      ? colors.warning
                      : colors.textSecondary,
                  fontWeight: '600',
                },
              ]}
            >
              {jours < 0
                ? `${Math.abs(jours)} j de retard`
                : jours === 0
                ? "Aujourd'hui"
                : `Dans ${jours} j`}
            </Text>
          </View>
        ) : null}
        {devoir.dureeEstimeeMinutes ? (
          <View style={styles.metaItem}>
            <Ionicons name="hourglass-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>~ {devoir.dureeEstimeeMinutes} min</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.tagsRow}>
        {devoir.estObligatoire ? (
          <View style={styles.tag}>
            <Ionicons name="alert-circle-outline" size={11} color={colors.danger} />
            <Text style={[styles.tagText, { color: colors.danger }]}>Obligatoire</Text>
          </View>
        ) : null}
        {devoir.estNote ? (
          <View style={styles.tag}>
            <Ionicons name="star-outline" size={11} color={colors.primary} />
            <Text style={[styles.tagText, { color: colors.primary }]}>
              Noté{devoir.bareme ? ` /${devoir.bareme}` : ''}
            </Text>
          </View>
        ) : null}
        {devoir.niveauDifficulteLibelle ? (
          <View style={styles.tag}>
            <Ionicons name="speedometer-outline" size={11} color={colors.textSecondary} />
            <Text style={styles.tagText}>{devoir.niveauDifficulteLibelle}</Text>
          </View>
        ) : null}
      </View>

      {devoir.consignes ? (
        <View style={styles.consignesBox}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.consignesText} numberOfLines={3}>
            {devoir.consignes}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipPressed: { opacity: 0.7 },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  card: { marginBottom: spacing.sm },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  matiereDot: { width: 10, height: 10, borderRadius: 5 },
  matiere: { ...typography.bodyBold, color: colors.text },
  subtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  title: { ...typography.body, color: colors.text, fontWeight: '600' },
  description: { ...typography.caption, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typography.small, color: colors.textSecondary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  tagText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  consignesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  consignesText: { ...typography.small, color: colors.textSecondary, flex: 1, lineHeight: 16 },
});
