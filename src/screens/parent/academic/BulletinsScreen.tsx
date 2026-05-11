import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { academicApi } from '../../../api/academicApi';
import { ChildSwitcher } from '../../../components/ChildSwitcher';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorView,
  Loader,
  Screen,
  SectionHeader,
} from '../../../components/ui';
import { useSelectedChild } from '../../../contexts/SelectedChildContext';
import { colors, radius, spacing, typography } from '../../../theme';
import type { BulletinParent } from '../../../types/academic';
import { downloadAndShare } from '../../../utils/download';
import { formatDate } from '../../../utils/format';

export function BulletinsScreen() {
  const { selectedChild, children, isLoading: childrenLoading } = useSelectedChild();
  const eleveId = selectedChild?.id;

  const query = useQuery({
    queryKey: ['academic', 'bulletins', eleveId],
    queryFn: () => academicApi.getBulletins(eleveId!),
    enabled: !!eleveId,
  });

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
      <View style={{ height: spacing.lg }} />

      {query.isLoading ? (
        <Loader label="Chargement des bulletins…" />
      ) : query.isError ? (
        <ErrorView
          message={(query.error as Error)?.message}
          onRetry={query.refetch}
        />
      ) : !query.data || query.data.length === 0 ? (
        <EmptyState
          title="Aucun bulletin"
          description="Aucun bulletin n'a encore été publié pour cet enfant."
        />
      ) : (
        <>
          <SectionHeader
            title={`${query.data.length} bulletin${query.data.length > 1 ? 's' : ''}`}
            subtitle={selectedChild?.fullName}
          />
          {query.data.map((b) => (
            <BulletinCard key={b.id} bulletin={b} eleveId={eleveId!} />
          ))}
        </>
      )}
    </Screen>
  );
}

function BulletinCard({ bulletin, eleveId }: { bulletin: BulletinParent; eleveId: number }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAndShare(
        academicApi.bulletinPdfUrl(eleveId, bulletin.id),
        `bulletin-${bulletin.numeroBulletin ?? bulletin.id}.pdf`
      );
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? 'Échec du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  const moyenne = bulletin.moyenneGenerale;
  const moyenneClasse = bulletin.moyenneClasse;
  const aboveClass =
    typeof moyenne === 'number' && typeof moyenneClasse === 'number' && moyenne >= moyenneClasse;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.period}>
            {bulletin.periodeLibelle ?? `Bulletin #${bulletin.id}`}
          </Text>
          {bulletin.numeroBulletin ? (
            <Text style={styles.subtitle}>N° {bulletin.numeroBulletin}</Text>
          ) : null}
        </View>
        {bulletin.statutLibelle ? (
          <Badge
            label={bulletin.statutLibelle}
            tone={bulletin.estDisponible ? 'success' : 'warning'}
          />
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Moyenne</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {typeof moyenne === 'number' ? moyenne.toFixed(2) : '—'}
          </Text>
          {typeof moyenneClasse === 'number' ? (
            <Text style={styles.statHint}>
              Classe : {moyenneClasse.toFixed(2)}{' '}
              {aboveClass ? (
                <Ionicons name="trending-up" size={12} color={colors.success} />
              ) : (
                <Ionicons name="trending-down" size={12} color={colors.warning} />
              )}
            </Text>
          ) : null}
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Rang</Text>
          <Text style={styles.statValue}>
            {bulletin.rang ? `${bulletin.rang}` : '—'}
            {bulletin.rangSur ? (
              <Text style={styles.statHint}> /{bulletin.rangSur}</Text>
            ) : null}
          </Text>
        </View>

        {bulletin.mentionLibelle ? (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Mention</Text>
              <View style={styles.mentionWrapper}>
                <View
                  style={[
                    styles.mentionDot,
                    bulletin.mentionCouleur
                      ? { backgroundColor: bulletin.mentionCouleur }
                      : { backgroundColor: colors.primary },
                  ]}
                />
                <Text style={styles.mentionText} numberOfLines={1}>
                  {bulletin.mentionLibelle}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </View>

      {(bulletin.nombreAbsences ?? 0) > 0 || (bulletin.nombreRetards ?? 0) > 0 ? (
        <View style={styles.absRow}>
          {(bulletin.nombreAbsences ?? 0) > 0 ? (
            <View style={styles.absChip}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
              <Text style={styles.absText}>
                {bulletin.nombreAbsences} absence{bulletin.nombreAbsences! > 1 ? 's' : ''}
              </Text>
            </View>
          ) : null}
          {(bulletin.nombreRetards ?? 0) > 0 ? (
            <View style={styles.absChip}>
              <Ionicons name="time-outline" size={14} color={colors.warning} />
              <Text style={styles.absText}>
                {bulletin.nombreRetards} retard{bulletin.nombreRetards! > 1 ? 's' : ''}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {bulletin.datePublication ? (
        <Text style={styles.meta}>Publié le {formatDate(bulletin.datePublication)}</Text>
      ) : null}

      {bulletin.estDisponible ? (
        <Button
          label="Télécharger le PDF"
          variant="secondary"
          size="sm"
          loading={downloading}
          onPress={handleDownload}
          icon={<Ionicons name="download-outline" size={16} color={colors.text} />}
          style={{ marginTop: spacing.md }}
        />
      ) : (
        <View style={styles.unavailableBox}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
          <Text style={styles.unavailableText}>
            Bulletin pas encore publié — non disponible au téléchargement
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  period: { ...typography.bodyBold, color: colors.text, fontSize: 16 },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  statBlock: { flex: 1, alignItems: 'flex-start' },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
    alignSelf: 'stretch',
  },
  statLabel: {
    ...typography.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: { ...typography.h3, color: colors.text },
  statHint: { ...typography.small, color: colors.textSecondary },
  mentionWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  mentionDot: { width: 8, height: 8, borderRadius: 4 },
  mentionText: { ...typography.bodyBold, color: colors.text, fontSize: 13 },
  absRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  absChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  absText: { ...typography.small, color: colors.textSecondary },
  meta: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
  unavailableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  unavailableText: {
    ...typography.small,
    color: colors.textMuted,
    flex: 1,
  },
});
