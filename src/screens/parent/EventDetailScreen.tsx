import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { calendarApi } from '../../api/calendarApi';
import { Badge, Card, ErrorView, Loader, Screen } from '../../components/ui';
import type { CalendarStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { formatDate } from '../../utils/format';

type Route = RouteProp<CalendarStackParamList, 'EventDetail'>;

export function EventDetailScreen() {
  const { params } = useRoute<Route>();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['event', params.id],
    queryFn: () => calendarApi.getEvent(params.id),
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
    <Screen>
      <Card>
        {data.typeLabel ? (
          <Badge label={data.typeLabel} tone="primary" />
        ) : null}
        <Text style={styles.title}>{data.title}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>
            {formatDate(data.startDate, 'EEEE dd MMMM yyyy • HH:mm')}
            {data.endDate ? ` → ${formatDate(data.endDate, 'HH:mm')}` : ''}
          </Text>
        </View>

        {data.location ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{data.location}</Text>
          </View>
        ) : null}

        {data.organizerName ? (
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>Organisé par {data.organizerName}</Text>
          </View>
        ) : null}

        {data.description ? (
          <View style={styles.descBlock}>
            <Text style={styles.descTitle}>Description</Text>
            <Text style={styles.desc}>{data.description}</Text>
          </View>
        ) : null}

        {data.registrationRequired ? (
          <View style={styles.regBox}>
            <Badge
              label={data.registered ? 'Vous êtes inscrit' : 'Inscription requise'}
              tone={data.registered ? 'success' : 'warning'}
            />
          </View>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  metaText: { ...typography.body, color: colors.text, flex: 1 },
  descBlock: { marginTop: spacing.lg },
  descTitle: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  desc: { ...typography.body, color: colors.text, lineHeight: 22 },
  regBox: { marginTop: spacing.lg, alignItems: 'flex-start' },
});
