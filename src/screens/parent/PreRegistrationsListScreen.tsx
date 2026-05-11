import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { parentApi } from '../../api/parentApi';
import { Badge, Button, Card, EmptyState, ErrorView, Loader, Screen } from '../../components/ui';
import type { PreRegistrationsStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { formatDate } from '../../utils/format';
import { preRegStatusTone } from '../../utils/status';

type Nav = NativeStackNavigationProp<PreRegistrationsStackParamList, 'PreRegistrationsList'>;

export function PreRegistrationsListScreen() {
  const nav = useNavigation<Nav>();
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['parent', 'preregistrations'],
    queryFn: parentApi.getPreRegistrations,
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

  if (data.length === 0) {
    return (
      <Screen refreshing={isRefetching} onRefresh={refetch}>
        <EmptyState
          title="Aucune préinscription"
          description="Vous n'avez pas encore déposé de dossier de préinscription."
          action={
            <Button
              label="Nouvelle préinscription"
              onPress={() => nav.navigate('PreRegistrationForm', {})}
              icon={<Ionicons name="add" size={18} color="#FFF" />}
            />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <Button
        label="Nouvelle préinscription"
        onPress={() => nav.navigate('PreRegistrationForm', {})}
        icon={<Ionicons name="add" size={18} color="#FFF" />}
        style={styles.newBtn}
        fullWidth
      />

      {data.map((item) => (
        <Card
          key={item.id}
          style={styles.card}
          onPress={() =>
            nav.navigate('PreRegistrationDetail', { preRegistrationId: item.id })
          }
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.studentFullName}</Text>
              <Text style={styles.sub}>Dossier {item.registrationNumber}</Text>
            </View>
            <Badge label={item.statusLabel ?? item.status} tone={preRegStatusTone(item.status)} />
          </View>

          <View style={styles.infoRow}>
            <InfoItem label="Niveau demandé" value={item.requestedLevel} />
            <InfoItem label="Déposé le" value={formatDate(item.submissionDate)} />
          </View>

          {item.rejectionReason ? (
            <Text style={styles.reject}>Motif : {item.rejectionReason}</Text>
          ) : null}

          <Text style={styles.cta}>Toucher pour voir le détail →</Text>
        </Card>
      ))}
    </Screen>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  newBtn: { marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  name: { ...typography.bodyBold, color: colors.text },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row' },
  infoItem: { flex: 1 },
  infoLabel: { ...typography.small, color: colors.textMuted, textTransform: 'uppercase' },
  infoValue: { ...typography.bodyBold, color: colors.text, marginTop: 2 },
  reject: { ...typography.caption, color: colors.danger, marginTop: spacing.sm },
  cta: { ...typography.caption, color: colors.primary, marginTop: spacing.sm },
});
