import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { academicApi } from '../../../api/academicApi';
import { ChildSwitcher } from '../../../components/ChildSwitcher';
import {
  Card,
  EmptyState,
  ErrorView,
  Loader,
  Screen,
  SectionHeader,
} from '../../../components/ui';
import { useSelectedChild } from '../../../contexts/SelectedChildContext';
import { colors, radius, spacing, typography } from '../../../theme';
import type { EmploiDuTempsParent } from '../../../types/academic';

const JOURS: { value: number | undefined; label: string; full: string }[] = [
  { value: undefined, label: 'Sem.', full: 'Toute la semaine' },
  { value: 1, label: 'Lun', full: 'Lundi' },
  { value: 2, label: 'Mar', full: 'Mardi' },
  { value: 3, label: 'Mer', full: 'Mercredi' },
  { value: 4, label: 'Jeu', full: 'Jeudi' },
  { value: 5, label: 'Ven', full: 'Vendredi' },
];

export function EmploiDuTempsScreen() {
  const { selectedChild, children, isLoading: childrenLoading } = useSelectedChild();
  const eleveId = selectedChild?.id;

  // Auto-sélection : jour de la semaine courant si on est en semaine, sinon Lundi
  const todayIdx = new Date().getDay(); // 0=Dim, 1=Lun..6=Sam
  const initialJour = todayIdx >= 1 && todayIdx <= 5 ? todayIdx : 1;
  const [selectedJour, setSelectedJour] = useState<number | undefined>(initialJour);

  const query = useQuery({
    queryKey: ['academic', 'edt', eleveId, selectedJour],
    queryFn: () => academicApi.getEmploiDuTemps(eleveId!, selectedJour),
    enabled: !!eleveId,
  });

  // Tri par jour puis heure
  const sorted = useMemo(() => {
    const data = [...(query.data ?? [])];
    return data.sort((a, b) => {
      if ((a.jourSemaine ?? 0) !== (b.jourSemaine ?? 0)) {
        return (a.jourSemaine ?? 0) - (b.jourSemaine ?? 0);
      }
      return (a.heureDebut ?? '').localeCompare(b.heureDebut ?? '');
    });
  }, [query.data]);

  // Groupement par jour quand "Toute la semaine"
  const groupedByDay = useMemo(() => {
    if (selectedJour != null) return null;
    const map = new Map<number, EmploiDuTempsParent[]>();
    for (const s of sorted) {
      const j = s.jourSemaine ?? 0;
      const arr = map.get(j) ?? [];
      arr.push(s);
      map.set(j, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [sorted, selectedJour]);

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

      <View style={styles.daysRow}>
        {JOURS.map((j, idx) => {
          const active = selectedJour === j.value;
          return (
            <Pressable
              key={idx}
              onPress={() => setSelectedJour(j.value)}
              style={({ pressed }) => [
                styles.dayBtn,
                active && styles.dayBtnActive,
                pressed && styles.dayBtnPressed,
              ]}
            >
              <Text style={[styles.dayBtnText, active && styles.dayBtnTextActive]}>
                {j.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {query.isLoading ? (
        <Loader label="Chargement de l'emploi du temps…" />
      ) : query.isError ? (
        <ErrorView message={(query.error as Error)?.message} onRetry={query.refetch} />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="Aucun cours"
          description={
            selectedJour != null
              ? `Aucun cours prévu ${JOURS.find((j) => j.value === selectedJour)?.full.toLowerCase() ?? ''}.`
              : "Aucun cours dans l'emploi du temps."
          }
        />
      ) : groupedByDay ? (
        groupedByDay.map(([jour, seances]) => (
          <View key={jour} style={{ marginBottom: spacing.md }}>
            <SectionHeader title={JOURS.find((j) => j.value === jour)?.full ?? `Jour ${jour}`} />
            {seances.map((s) => (
              <SeanceCard key={s.id} seance={s} />
            ))}
          </View>
        ))
      ) : (
        <>
          <SectionHeader
            title={JOURS.find((j) => j.value === selectedJour)?.full ?? ''}
            subtitle={`${sorted.length} cours`}
          />
          {sorted.map((s) => (
            <SeanceCard key={s.id} seance={s} />
          ))}
        </>
      )}
    </Screen>
  );
}

function SeanceCard({ seance }: { seance: EmploiDuTempsParent }) {
  const heureDebut = seance.heureDebut?.slice(0, 5) ?? '—';
  const heureFin = seance.heureFin?.slice(0, 5) ?? '—';

  return (
    <Card style={styles.card}>
      <View style={styles.timeCol}>
        <Text style={styles.timeStart}>{heureDebut}</Text>
        <View style={styles.timeLine} />
        <Text style={styles.timeEnd}>{heureFin}</Text>
        {seance.dureeMinutes ? (
          <Text style={styles.timeDuration}>{seance.dureeMinutes} min</Text>
        ) : null}
      </View>

      <View
        style={[
          styles.colorBar,
          seance.matiereCouleur
            ? { backgroundColor: seance.matiereCouleur }
            : { backgroundColor: colors.primary },
        ]}
      />

      <View style={styles.infoCol}>
        <Text style={styles.matiere} numberOfLines={1}>
          {seance.matiereLibelle ?? '—'}
        </Text>
        {seance.typeSeanceLibelle ? (
          <Text style={styles.type}>{seance.typeSeanceLibelle}</Text>
        ) : null}

        <View style={styles.infoRow}>
          {seance.enseignantNomComplet ? (
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {seance.enseignantNomComplet}
              </Text>
            </View>
          ) : null}
        </View>
        {seance.salleNom || seance.batiment ? (
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {[seance.salleNom, seance.batiment].filter(Boolean).join(' • ')}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  daysRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dayBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dayBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayBtnPressed: { opacity: 0.7 },
  dayBtnText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  dayBtnTextActive: { color: '#FFFFFF' },
  card: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: 0,
    overflow: 'hidden',
  },
  timeCol: {
    width: 64,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  timeStart: { ...typography.bodyBold, color: colors.text, fontSize: 13 },
  timeLine: { width: 1, flex: 1, backgroundColor: colors.border, marginVertical: 4, minHeight: 12 },
  timeEnd: { ...typography.small, color: colors.textSecondary },
  timeDuration: { ...typography.small, color: colors.textMuted, marginTop: 2, fontSize: 10 },
  colorBar: { width: 4 },
  infoCol: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  matiere: { ...typography.bodyBold, color: colors.text },
  type: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row', marginTop: 4 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  infoText: { ...typography.small, color: colors.textSecondary, flex: 1 },
});
