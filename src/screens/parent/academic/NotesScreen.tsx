import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
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
  Select,
} from '../../../components/ui';
import { useSelectedChild } from '../../../contexts/SelectedChildContext';
import { colors, radius, spacing, typography } from '../../../theme';
import type {
  MoyenneGeneraleParent,
  MoyenneMatiereParent,
  NoteParent,
} from '../../../types/academic';
import { formatDate } from '../../../utils/format';

export function NotesScreen() {
  const { selectedChild, children, isLoading: childrenLoading } = useSelectedChild();
  const eleveId = selectedChild?.id;
  const [periodeId, setPeriodeId] = useState<number | undefined>();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const periodesQuery = useQuery({
    queryKey: ['academic', 'periodes'],
    queryFn: academicApi.getPeriodes,
  });

  useEffect(() => {
    if (periodeId == null && periodesQuery.data && periodesQuery.data.length > 0) {
      const courante = periodesQuery.data.find((p) => p.estCourante);
      setPeriodeId(courante?.id ?? periodesQuery.data[0].id);
    }
  }, [periodeId, periodesQuery.data]);

  const moyenneGeneraleQuery = useQuery({
    queryKey: ['academic', 'moyenne-generale', eleveId, periodeId],
    queryFn: () => academicApi.getMoyenneGenerale(eleveId!, periodeId!),
    enabled: !!eleveId && !!periodeId,
  });

  const moyennesQuery = useQuery({
    queryKey: ['academic', 'moyennes', eleveId, periodeId],
    queryFn: () => academicApi.getMoyennesParMatiere(eleveId!, periodeId!),
    enabled: !!eleveId && !!periodeId,
  });

  const notesQuery = useQuery({
    queryKey: ['academic', 'notes', eleveId, periodeId],
    queryFn: () => academicApi.getNotes(eleveId!, periodeId!),
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

  const notesByMatiere = useMemo(() => {
    const map = new Map<number, NoteParent[]>();
    for (const n of notesQuery.data ?? []) {
      if (n.matiereId == null) continue;
      const arr = map.get(n.matiereId) ?? [];
      arr.push(n);
      map.set(n.matiereId, arr);
    }
    return map;
  }, [notesQuery.data]);

  const toggleMatiere = (matiereId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(matiereId)) next.delete(matiereId);
      else next.add(matiereId);
      return next;
    });
  };

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
    moyenneGeneraleQuery.isRefetching || moyennesQuery.isRefetching || notesQuery.isRefetching;
  const refreshAll = () => {
    moyenneGeneraleQuery.refetch();
    moyennesQuery.refetch();
    notesQuery.refetch();
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

      <MoyenneGeneraleCard
        data={moyenneGeneraleQuery.data ?? null}
        loading={moyenneGeneraleQuery.isLoading}
      />

      <SectionHeader title="Moyennes par matière" />
      {moyennesQuery.isLoading ? (
        <Loader label="Chargement…" />
      ) : moyennesQuery.isError ? (
        <ErrorView
          message={(moyennesQuery.error as Error)?.message}
          onRetry={moyennesQuery.refetch}
        />
      ) : !moyennesQuery.data || moyennesQuery.data.length === 0 ? (
        <EmptyState
          title="Aucune moyenne"
          description="Aucune moyenne n'a été calculée pour cette période."
        />
      ) : (
        moyennesQuery.data.map((m) => (
          <MatiereCard
            key={m.matiereId ?? m.matiereLibelle ?? Math.random()}
            moyenne={m}
            notes={m.matiereId ? notesByMatiere.get(m.matiereId) ?? [] : []}
            expanded={m.matiereId != null && expanded.has(m.matiereId)}
            onToggle={() => m.matiereId != null && toggleMatiere(m.matiereId)}
          />
        ))
      )}
    </Screen>
  );
}

function MoyenneGeneraleCard({
  data,
  loading,
}: {
  data: MoyenneGeneraleParent | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card style={styles.moyenneCard}>
        <Loader label="Chargement…" />
      </Card>
    );
  }
  if (!data || data.moyenneGenerale == null) {
    return (
      <Card style={styles.moyenneCard}>
        <Text style={styles.moyenneEmpty}>
          Aucune moyenne générale disponible pour cette période
        </Text>
      </Card>
    );
  }

  const moyenne = data.moyenneGenerale;
  const color = moyenne >= 14 ? colors.success : moyenne >= 10 ? colors.primary : colors.warning;

  return (
    <Card style={styles.moyenneCard}>
      <Text style={styles.moyenneLabel}>Moyenne générale</Text>
      <Text style={[styles.moyenneValue, { color }]}>{moyenne.toFixed(2)}</Text>
      <Text style={styles.moyenneSur}>/ 20</Text>

      <View style={styles.moyenneFooter}>
        {data.rang ? (
          <View style={styles.moyenneFooterItem}>
            <Ionicons name="trophy-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.moyenneFooterText}>
              Rang {data.rang}
              {data.rangSur ? ` / ${data.rangSur}` : ''}
            </Text>
          </View>
        ) : null}
        {data.mentionLibelle ? (
          <View style={styles.moyenneFooterItem}>
            <View
              style={[
                styles.mentionDot,
                data.mentionCouleur
                  ? { backgroundColor: data.mentionCouleur }
                  : { backgroundColor: colors.primary },
              ]}
            />
            <Text style={styles.moyenneFooterText}>{data.mentionLibelle}</Text>
          </View>
        ) : null}
        {data.nombreMatieres ? (
          <View style={styles.moyenneFooterItem}>
            <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.moyenneFooterText}>{data.nombreMatieres} matières</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

function MatiereCard({
  moyenne,
  notes,
  expanded,
  onToggle,
}: {
  moyenne: MoyenneMatiereParent;
  notes: NoteParent[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const m = moyenne.moyenne;
  const valueColor =
    typeof m === 'number'
      ? m >= 14
        ? colors.success
        : m >= 10
        ? colors.primary
        : colors.warning
      : colors.textMuted;

  const aboveClass =
    typeof m === 'number' &&
    typeof moyenne.moyenneClasse === 'number' &&
    m >= moyenne.moyenneClasse;

  return (
    <Card style={styles.matiereCard}>
      <Pressable style={styles.matiereHeader} onPress={onToggle}>
        <View
          style={[
            styles.matiereDot,
            moyenne.matiereCouleur
              ? { backgroundColor: moyenne.matiereCouleur }
              : { backgroundColor: colors.primary },
          ]}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.matiereName}>{moyenne.matiereLibelle ?? '—'}</Text>
          <Text style={styles.matiereMeta}>
            {moyenne.coefficient ? `Coef ${moyenne.coefficient}` : null}
            {moyenne.nombreNotes ? ` • ${moyenne.nombreNotes} note${moyenne.nombreNotes > 1 ? 's' : ''}` : null}
          </Text>
        </View>
        <Text style={[styles.matiereValue, { color: valueColor }]}>
          {typeof m === 'number' ? m.toFixed(2) : '—'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
          style={{ marginLeft: 4 }}
        />
      </Pressable>

      <View style={styles.matiereSubRow}>
        {typeof moyenne.moyenneClasse === 'number' ? (
          <View style={styles.subItem}>
            <Ionicons
              name={aboveClass ? 'trending-up' : 'trending-down'}
              size={12}
              color={aboveClass ? colors.success : colors.warning}
            />
            <Text style={styles.subText}>Classe : {moyenne.moyenneClasse.toFixed(2)}</Text>
          </View>
        ) : null}
        {moyenne.rang ? (
          <View style={styles.subItem}>
            <Ionicons name="trophy-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.subText}>
              Rang {moyenne.rang}
              {moyenne.rangSur ? `/${moyenne.rangSur}` : ''}
            </Text>
          </View>
        ) : null}
        {moyenne.mentionLibelle ? (
          <View style={styles.subItem}>
            <View
              style={[
                styles.miniDot,
                moyenne.mentionCouleur
                  ? { backgroundColor: moyenne.mentionCouleur }
                  : { backgroundColor: colors.primary },
              ]}
            />
            <Text style={styles.subText}>{moyenne.mentionLibelle}</Text>
          </View>
        ) : null}
      </View>

      {expanded ? (
        notes.length === 0 ? (
          <Text style={styles.noNotesText}>Aucune note détaillée pour cette matière</Text>
        ) : (
          <View style={styles.notesContainer}>
            {notes.map((n) => (
              <NoteRow key={n.id} note={n} />
            ))}
          </View>
        )
      ) : null}
    </Card>
  );
}

function NoteRow({ note }: { note: NoteParent }) {
  const valeur = note.valeurNote;
  const sur = note.noteSur ?? 20;
  const sur20 = note.noteSur20;
  const isAbsent = note.estAbsent;
  const isDispense = note.estDispense;

  return (
    <View style={styles.noteRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.noteEval}>{note.evaluationLibelle ?? note.typeEvaluationLibelle ?? 'Évaluation'}</Text>
        <Text style={styles.noteMeta}>
          {note.dateEvaluation ? formatDate(note.dateEvaluation) : null}
          {note.coefficientEvaluation ? ` • Coef ${note.coefficientEvaluation}` : null}
          {note.typeEvaluationLibelle && note.evaluationLibelle ? ` • ${note.typeEvaluationLibelle}` : null}
        </Text>
        {note.appreciation ? (
          <Text style={styles.noteAppreciation}>« {note.appreciation} »</Text>
        ) : null}
      </View>
      <View style={styles.noteValueBox}>
        {isAbsent ? (
          <Text style={[styles.noteValueText, { color: colors.danger }]}>ABS</Text>
        ) : isDispense ? (
          <Text style={[styles.noteValueText, { color: colors.textMuted }]}>DIS</Text>
        ) : typeof valeur === 'number' ? (
          <>
            <Text style={styles.noteValueText}>
              {valeur.toFixed(2)}
              <Text style={styles.noteValueSur}>/{sur}</Text>
            </Text>
            {typeof sur20 === 'number' && sur !== 20 ? (
              <Text style={styles.noteSur20}>= {sur20.toFixed(2)}/20</Text>
            ) : null}
          </>
        ) : (
          <Text style={[styles.noteValueText, { color: colors.textMuted }]}>—</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  moyenneCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    padding: spacing.lg,
  },
  moyenneLabel: { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase' },
  moyenneValue: { fontSize: 48, fontWeight: '800', lineHeight: 56, marginTop: spacing.xs },
  moyenneSur: { ...typography.caption, color: colors.textMuted, marginTop: -8 },
  moyenneEmpty: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  moyenneFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  moyenneFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moyenneFooterText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  mentionDot: { width: 10, height: 10, borderRadius: 5 },
  matiereCard: { marginBottom: spacing.sm, padding: spacing.md },
  matiereHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  matiereDot: { width: 10, height: 10, borderRadius: 5 },
  matiereName: { ...typography.bodyBold, color: colors.text },
  matiereMeta: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  matiereValue: { ...typography.h3, fontWeight: '700' },
  matiereSubRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingLeft: 18,
  },
  subItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subText: { ...typography.small, color: colors.textSecondary },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
  notesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  noNotesText: {
    ...typography.small,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  noteEval: { ...typography.body, color: colors.text, fontWeight: '600' },
  noteMeta: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  noteAppreciation: {
    ...typography.small,
    color: colors.text,
    fontStyle: 'italic',
    marginTop: 4,
  },
  noteValueBox: { alignItems: 'flex-end', minWidth: 70, marginLeft: spacing.md },
  noteValueText: { ...typography.bodyBold, color: colors.text, fontSize: 16 },
  noteValueSur: { ...typography.small, color: colors.textMuted, fontWeight: '400' },
  noteSur20: { ...typography.small, color: colors.textMuted, marginTop: 2 },
});
