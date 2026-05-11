import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { parentApi } from '../../api/parentApi';
import {
  Badge,
  Button,
  Card,
  ErrorView,
  Loader,
  Screen,
  SectionHeader,
} from '../../components/ui';
import type { PreRegistrationsStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { formatDate } from '../../utils/format';
import { preRegStatusTone } from '../../utils/status';

type DetailRoute = RouteProp<PreRegistrationsStackParamList, 'PreRegistrationDetail'>;
type Nav = NativeStackNavigationProp<PreRegistrationsStackParamList, 'PreRegistrationDetail'>;

export function PreRegistrationDetailScreen() {
  const { params } = useRoute<DetailRoute>();
  const nav = useNavigation<Nav>();

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['parent', 'preregistration', params.preRegistrationId],
    queryFn: () => parentApi.getPreRegistrationDetails(params.preRegistrationId),
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

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <Card style={styles.hero}>
        <Text style={styles.title}>
          {data.studentFullName ?? `${data.studentFirstName} ${data.studentLastName}`}
        </Text>
        {data.registrationNumber ? (
          <Text style={styles.sub}>Dossier {data.registrationNumber}</Text>
        ) : null}
        <View style={styles.badgeRow}>
          <Badge
            label={data.statusLabel ?? data.status}
            tone={preRegStatusTone(data.status)}
          />
        </View>
      </Card>

      {data.rejectionReason ? (
        <Card style={styles.reject}>
          <Text style={styles.rejectTitle}>Motif de rejet</Text>
          <Text style={styles.rejectText}>{data.rejectionReason}</Text>
        </Card>
      ) : null}

      {data.adminNotes ? (
        <Card style={styles.note}>
          <Text style={styles.noteTitle}>Notes de l'administration</Text>
          <Text style={styles.noteText}>{data.adminNotes}</Text>
        </Card>
      ) : null}

      <SectionHeader title="Identité de l'élève" />
      <Card style={styles.card}>
        <Row
          label="Genre"
          value={data.studentGender === 'MALE' ? 'Masculin' : data.studentGender === 'FEMALE' ? 'Féminin' : data.studentGender}
        />
        <Row label="Date de naissance" value={formatDate(data.studentDateOfBirth)} />
        <Row label="Lieu de naissance" value={data.studentPlaceOfBirth ?? '—'} />
        <Row label="Nationalité" value={data.studentNationality ?? '—'} last />
      </Card>

      <SectionHeader title="Scolarité demandée" />
      <Card style={styles.card}>
        <Row label="Année scolaire" value={data.academicYearLabel ?? '—'} />
        <Row label="Niveau" value={data.requestedLevel ?? '—'} />
        <Row label="École précédente" value={data.studentPreviousSchool ?? '—'} />
        <Row label="Classe précédente" value={data.studentPreviousClass ?? '—'} last />
      </Card>

      <SectionHeader title="Services demandés" />
      <Card style={styles.card}>
        <Row
          label="Transport"
          value={data.transportationNeeded ? 'Oui' : 'Non'}
        />
        <Row
          label="Cantine"
          value={data.canteenSubscription ? 'Oui' : 'Non'}
          last
        />
      </Card>

      {data.specialNeeds ? (
        <>
          <SectionHeader title="Besoins spécifiques" />
          <Card style={styles.card}>
            <Row label="Détails" value={data.specialNeeds} last />
          </Card>
        </>
      ) : null}

      {data.additionalComments ? (
        <>
          <SectionHeader title="Commentaires" />
          <Card style={styles.card}>
            <Text style={styles.comments}>{data.additionalComments}</Text>
          </Card>
        </>
      ) : null}

      <View style={styles.actions}>
        {data.canModify ? (
          <Button
            label="Modifier"
            variant="secondary"
            onPress={() =>
              nav.navigate('PreRegistrationForm', { preRegistrationId: data.id })
            }
            icon={<Ionicons name="create-outline" size={16} color={colors.text} />}
            style={{ flex: 1 }}
          />
        ) : null}
        {data.canUploadDocuments ? (
          <Button
            label="Documents"
            onPress={() =>
              nav.navigate('PreRegistrationDocuments', {
                preRegistrationId: data.id,
                title: `Documents - ${data.studentFullName ?? ''}`,
              })
            }
            icon={<Ionicons name="folder-outline" size={16} color="#FFF" />}
            style={{ flex: 1 }}
          />
        ) : null}
      </View>

      {data.submissionDate ? (
        <Text style={styles.footerMeta}>Déposé le {formatDate(data.submissionDate)}</Text>
      ) : null}
    </Screen>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.text, textAlign: 'center' },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  badgeRow: { marginTop: spacing.md },
  card: { marginBottom: spacing.sm, padding: 0 },
  reject: { marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.dangerBg },
  rejectTitle: { ...typography.label, color: colors.danger, marginBottom: spacing.xs },
  rejectText: { ...typography.body, color: colors.danger },
  note: { marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.warningBg },
  noteTitle: { ...typography.label, color: colors.warning, marginBottom: spacing.xs },
  noteText: { ...typography.body, color: colors.text },
  row: { flexDirection: 'row', padding: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  rowValue: { ...typography.body, color: colors.text, flex: 1.4, textAlign: 'right' },
  comments: { ...typography.body, color: colors.text, padding: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  footerMeta: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
