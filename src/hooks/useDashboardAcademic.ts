import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { academicApi } from '../api/academicApi';
import type { ChildSummary } from '../types/parent';

/**
 * Agrège les données pédagogiques de tous les enfants pour le dashboard.
 *
 * Utilise `useQueries` (parallélisation native) :
 *  - 1 query "périodes" pour récupérer la période courante
 *  - N queries devoirs-à-rendre (1 par enfant)
 *  - N queries évaluations-à-venir (1 par enfant)
 *  - N queries moyenne-générale (1 par enfant, dépend de la période courante)
 */
export function useDashboardAcademic(children: ChildSummary[]) {
  const periodesQuery = useQuery({
    queryKey: ['academic', 'periodes'],
    queryFn: academicApi.getPeriodes,
    staleTime: 5 * 60_000,
  });

  const periodeCourante = useMemo(() => {
    const list = periodesQuery.data ?? [];
    return list.find((p) => p.estCourante) ?? list[0];
  }, [periodesQuery.data]);

  const devoirsQueries = useQueries({
    queries: children.map((c) => ({
      queryKey: ['academic', 'dashboard-devoirs-a-rendre', c.id],
      queryFn: () => academicApi.getDevoirsARendre(c.id, 7),
      enabled: !!c.id,
      staleTime: 60_000,
    })),
  });

  const evaluationsQueries = useQueries({
    queries: children.map((c) => ({
      queryKey: ['academic', 'dashboard-evaluations-avenir', c.id],
      queryFn: () => academicApi.getEvaluationsAVenir(c.id, 14),
      enabled: !!c.id,
      staleTime: 60_000,
    })),
  });

  const moyennesQueries = useQueries({
    queries: children.map((c) => ({
      queryKey: ['academic', 'dashboard-moyenne', c.id, periodeCourante?.id],
      queryFn: () => academicApi.getMoyenneGenerale(c.id, periodeCourante!.id),
      enabled: !!c.id && !!periodeCourante?.id,
      staleTime: 5 * 60_000,
    })),
  });

  const absencesStatsQueries = useQueries({
    queries: children.map((c) => ({
      queryKey: ['academic', 'dashboard-stats-assiduite', c.id, periodeCourante?.id],
      queryFn: () => academicApi.getStatistiquesAssiduite(c.id, periodeCourante!.id),
      enabled: !!c.id && !!periodeCourante?.id,
      staleTime: 5 * 60_000,
    })),
  });

  // Agrégats globaux pour la carte "À ne pas manquer"
  const aggregates = useMemo(() => {
    let devoirsARendre = 0;
    let devoirsEnRetard = 0;
    let evaluationsAVenir = 0;

    for (const q of devoirsQueries) {
      const list = q.data ?? [];
      for (const d of list) {
        if (d.estEnRetard) devoirsEnRetard += 1;
        else devoirsARendre += 1;
      }
    }

    for (const q of evaluationsQueries) {
      evaluationsAVenir += (q.data ?? []).length;
    }

    return { devoirsARendre, devoirsEnRetard, evaluationsAVenir };
  }, [devoirsQueries, evaluationsQueries]);

  // Vue par enfant (pour cartes "Suivi pédagogique")
  const perChild = useMemo(() => {
    return children.map((c, idx) => {
      const devoirs = devoirsQueries[idx]?.data ?? [];
      const evaluations = evaluationsQueries[idx]?.data ?? [];
      const moyenne = moyennesQueries[idx]?.data ?? null;
      const stats = absencesStatsQueries[idx]?.data ?? null;
      return {
        child: c,
        moyenneGenerale: moyenne?.moyenneGenerale ?? null,
        rang: moyenne?.rang ?? null,
        rangSur: moyenne?.rangSur ?? null,
        mentionLibelle: moyenne?.mentionLibelle ?? null,
        mentionCouleur: moyenne?.mentionCouleur ?? null,
        nbDevoirsARendre: devoirs.filter((d) => !d.estEnRetard).length,
        nbDevoirsEnRetard: devoirs.filter((d) => d.estEnRetard).length,
        nbEvaluationsAVenir: evaluations.length,
        nbAbsences: stats?.nombreAbsences ?? 0,
        nbAbsencesInjustifiees: stats?.nombreAbsencesInjustifiees ?? 0,
      };
    });
  }, [
    children,
    devoirsQueries,
    evaluationsQueries,
    moyennesQueries,
    absencesStatsQueries,
  ]);

  const isLoading =
    periodesQuery.isLoading ||
    devoirsQueries.some((q) => q.isLoading) ||
    evaluationsQueries.some((q) => q.isLoading);

  const refetch = () => {
    periodesQuery.refetch();
    devoirsQueries.forEach((q) => q.refetch());
    evaluationsQueries.forEach((q) => q.refetch());
    moyennesQueries.forEach((q) => q.refetch());
    absencesStatsQueries.forEach((q) => q.refetch());
  };

  return {
    periodeCourante,
    aggregates,
    perChild,
    isLoading,
    refetch,
  };
}
