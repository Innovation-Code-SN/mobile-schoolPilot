import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { calendarApi } from '../../api/calendarApi';
import {
  Badge,
  Card,
  EmptyState,
  ErrorView,
  Loader,
  Screen,
  SectionHeader,
} from '../../components/ui';
import type { CalendarStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';
import type { SchoolEventDto } from '../../types/calendar';
import { formatDate } from '../../utils/format';

type Nav = NativeStackNavigationProp<CalendarStackParamList, 'CalendarHome'>;

function eventTypeIcon(type?: string): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap {
  switch ((type ?? '').toUpperCase()) {
    case 'EXAM':
      return 'school-outline';
    case 'PARENT_MEETING':
    case 'MEETING':
      return 'people-outline';
    case 'HOLIDAY':
      return 'sunny-outline';
    case 'TRIP':
      return 'bus-outline';
    case 'CEREMONY':
      return 'ribbon-outline';
    default:
      return 'calendar-outline';
  }
}

function groupByMonth(events: SchoolEventDto[]): Record<string, SchoolEventDto[]> {
  const groups: Record<string, SchoolEventDto[]> = {};
  for (const e of events) {
    const d = new Date(e.startDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return groups;
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
}

export function CalendarScreen() {
  const nav = useNavigation<Nav>();

  const upcomingQuery = useQuery({
    queryKey: ['calendar', 'upcoming'],
    queryFn: () => calendarApi.getUpcomingEvents(0, 50),
  });

  const todayQuery = useQuery({
    queryKey: ['calendar', 'today'],
    queryFn: calendarApi.getTodayEvents,
  });

  const grouped = useMemo(() => {
    const events = upcomingQuery.data?.content ?? [];
    return groupByMonth(events);
  }, [upcomingQuery.data]);

  const sortedKeys = Object.keys(grouped).sort();

  return (
    <Screen
      refreshing={upcomingQuery.isRefetching}
      onRefresh={() => {
        upcomingQuery.refetch();
        todayQuery.refetch();
      }}
    >
      {todayQuery.data && todayQuery.data.length > 0 ? (
        <>
          <SectionHeader title="Aujourd'hui" subtitle={`${todayQuery.data.length} événement(s)`} />
          {todayQuery.data.map((e) => (
            <EventCard key={e.id} event={e} onPress={() => nav.navigate('EventDetail', { id: e.id })} highlighted />
          ))}
        </>
      ) : null}

      {upcomingQuery.isLoading ? (
        <Loader label="Chargement du calendrier…" />
      ) : upcomingQuery.isError ? (
        <ErrorView
          message={(upcomingQuery.error as Error)?.message}
          onRetry={() => upcomingQuery.refetch()}
        />
      ) : sortedKeys.length === 0 ? (
        <EmptyState
          title="Aucun événement à venir"
          description="Le calendrier scolaire est vide pour le moment."
        />
      ) : (
        sortedKeys.map((monthKey) => (
          <View key={monthKey} style={{ marginBottom: spacing.lg }}>
            <SectionHeader title={monthLabel(monthKey)} />
            {grouped[monthKey].map((e) => (
              <EventCard
                key={e.id}
                event={e}
                onPress={() => nav.navigate('EventDetail', { id: e.id })}
              />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

function EventCard({
  event,
  onPress,
  highlighted,
}: {
  event: SchoolEventDto;
  onPress: () => void;
  highlighted?: boolean;
}) {
  const date = new Date(event.startDate);
  const day = String(date.getDate()).padStart(2, '0');
  const monthShort = date.toLocaleDateString('fr-FR', { month: 'short' });

  return (
    <Card
      style={[styles.card, highlighted && styles.cardHighlighted] as never}
      onPress={onPress}
    >
      <View style={styles.row}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateMonth}>{monthShort}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Ionicons name={eventTypeIcon(event.type)} size={16} color={colors.primary} />
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
          </View>
          {event.location ? (
            <Text style={styles.meta}>
              <Ionicons name="location-outline" size={12} color={colors.textMuted} />{' '}
              {event.location}
            </Text>
          ) : null}
          <Text style={styles.meta}>{formatDate(event.startDate, 'EEEE dd MMM • HH:mm')}</Text>
          {event.registrationRequired ? (
            <View style={{ marginTop: spacing.xs }}>
              <Badge
                label={event.registered ? 'Inscrit' : 'Inscription requise'}
                tone={event.registered ? 'success' : 'warning'}
              />
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  cardHighlighted: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  row: { flexDirection: 'row', gap: spacing.md },
  dateBox: {
    width: 56,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  dateDay: { ...typography.h2, color: colors.primary },
  dateMonth: { ...typography.small, color: colors.primary, textTransform: 'uppercase' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 },
  title: { ...typography.bodyBold, color: colors.text, flex: 1 },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
