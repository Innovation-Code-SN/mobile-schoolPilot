import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  NOTIFICATION_CATEGORY_COLORS,
  NOTIFICATION_CATEGORY_ICONS,
  NOTIFICATION_CATEGORY_LABELS,
  notificationApi,
  type NotificationDto,
  type NotificationCategory,
} from '../../api/notificationApi';
import { Badge, Card, EmptyState, ErrorView, Loader, Screen } from '../../components/ui';
import type { MoreStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';

type Nav = NativeStackNavigationProp<MoreStackParamList>;

const PAGE_SIZE = 20;

export function NotificationsScreen() {
  const nav = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const [markingAll, setMarkingAll] = useState(false);

  const query = useInfiniteQuery({
    queryKey: ['notifications', 'list'],
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }) =>
      notificationApi.getList(pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
  });

  const items = useMemo<NotificationDto[]>(
    () => query.data?.pages.flatMap((p) => p.content) ?? [],
    [query.data]
  );

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  /**
   * Mappe l'actionUrl web vers une navigation mobile parent.
   * Stratégie : on essaie de matcher les patterns connus du portail parent ;
   * sinon on reste sur l'écran Notifications.
   */
  const handlePress = useCallback(
    (notif: NotificationDto) => {
      if (!notif.isRead) {
        markReadMutation.mutate(notif.id);
      }

      const url = notif.actionUrl ?? '';

      // /parent/children/{id}?tab=health
      const childMatch = url.match(/^\/parent\/children\/(\d+)/);
      if (childMatch) {
        nav.navigate('ChildDetail', {
          childId: parseInt(childMatch[1], 10),
        });
        return;
      }

      // /parent/preregistrations/{id}
      const preRegMatch = url.match(/^\/parent\/preregistrations\/(\d+)/);
      if (preRegMatch) {
        nav.navigate('PreRegistrationDetail', {
          preRegistrationId: parseInt(preRegMatch[1], 10),
        });
        return;
      }

      // /parent/invoices, /parent/finance/* — on n'a pas encore d'écran
      // détaillé sur mobile, on laisse l'utilisateur naviguer manuellement.
      // On ne fait rien d'autre que marquer comme lu.
    },
    [markReadMutation, nav]
  );

  const handleLongPress = useCallback(
    (notif: NotificationDto) => {
      Alert.alert(
        'Supprimer la notification',
        `Supprimer "${notif.title}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => deleteMutation.mutate(notif.id),
          },
        ]
      );
    },
    [deleteMutation]
  );

  const handleMarkAllRead = useCallback(() => {
    Alert.alert(
      'Tout marquer comme lu',
      'Toutes vos notifications seront marquées comme lues. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setMarkingAll(true);
            try {
              await markAllReadMutation.mutateAsync();
            } finally {
              setMarkingAll(false);
            }
          },
        },
      ]
    );
  }, [markAllReadMutation]);

  const hasUnread = items.some((n) => !n.isRead);

  if (query.isLoading) {
    return (
      <Screen>
        <Loader label="Chargement des notifications…" />
      </Screen>
    );
  }

  if (query.isError) {
    return (
      <Screen>
        <ErrorView
          message={(query.error as Error)?.message}
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} padded={false}>
      {/* Header avec action "Tout marquer lu" */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {items.length === 0
              ? 'Aucune notification'
              : `${items.length} notification${items.length > 1 ? 's' : ''}`}
          </Text>
        </View>
        {hasUnread ? (
          <Pressable
            onPress={handleMarkAllRead}
            disabled={markingAll}
            style={({ pressed }) => [
              styles.markAllBtn,
              pressed && styles.pressed,
              markingAll && styles.disabled,
            ]}
            hitSlop={8}
          >
            <Ionicons name="checkmark-done" size={16} color={colors.primary} />
            <Text style={styles.markAllText}>Tout lu</Text>
          </Pressable>
        ) : null}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon="notifications-off-outline"
            title="Aucune notification"
            description="Vous serez prévenu·e ici dès qu'un événement concernera vos enfants."
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <NotificationRow
              notif={item}
              onPress={() => handlePress(item)}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching && !query.isFetchingNextPage}
              onRefresh={() => query.refetch()}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) {
              query.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <Loader />
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

interface NotificationRowProps {
  notif: NotificationDto;
  onPress: () => void;
  onLongPress: () => void;
}

function NotificationRow({ notif, onPress, onLongPress }: NotificationRowProps) {
  const category = (notif.category ?? 'SYSTEM') as NotificationCategory;
  const iconName = NOTIFICATION_CATEGORY_ICONS[category] ?? 'notifications';
  const accent = NOTIFICATION_CATEGORY_COLORS[category] ?? colors.primary;
  const isUrgent = notif.priority === 'HIGH' || notif.priority === 'URGENT';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card
        style={{
          ...styles.row,
          ...(!notif.isRead ? styles.rowUnread : null),
          ...(isUrgent ? styles.rowUrgent : null),
        }}
      >
        <View style={[styles.iconWrap, { backgroundColor: accent + '1A' }]}>
          <Ionicons name={iconName as any} size={20} color={accent} />
          {!notif.isRead ? <View style={styles.unreadDot} /> : null}
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.titleText, !notif.isRead && styles.titleUnread]}
              numberOfLines={2}
            >
              {notif.title}
            </Text>
            {isUrgent ? <Badge label="URGENT" tone="danger" /> : null}
          </View>

          {notif.message ? (
            <Text style={styles.message} numberOfLines={3}>
              {notif.message}
            </Text>
          ) : null}

          <View style={styles.meta}>
            <Badge
              label={notif.categoryLabel ?? NOTIFICATION_CATEGORY_LABELS[category]}
              tone="neutral"
            />
            <Text style={styles.time}>
              {notif.timeAgo ?? formatDate(notif.createdAt)}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.toLocaleDateString('fr-FR')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.primary + '14',
  },
  markAllText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  disabled: { opacity: 0.4 },

  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  rowUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  rowUrgent: {
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.surface,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  titleText: { ...typography.body, color: colors.text, flex: 1 },
  titleUnread: { fontWeight: '700' },

  message: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  time: { ...typography.small, color: colors.textMuted },

  emptyWrapper: { flex: 1, justifyContent: 'center' },
  footerLoader: { paddingVertical: spacing.lg },
  pressed: { opacity: 0.7 },
});
