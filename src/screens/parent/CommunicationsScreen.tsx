import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { communicationApi } from '../../api/communicationApi';
import {
  Badge,
  Card,
  EmptyState,
  ErrorView,
  Loader,
  Screen,
} from '../../components/ui';
import type { CommunicationsStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';
import type { AnnouncementDto, MessageDto } from '../../types/communication';
import { formatDate } from '../../utils/format';

type Tab = 'announcements' | 'messages';
type Nav = NativeStackNavigationProp<CommunicationsStackParamList, 'CommunicationsHome'>;

export function CommunicationsScreen() {
  const [tab, setTab] = useState<Tab>('announcements');
  const nav = useNavigation<Nav>();

  const announcements = useQuery({
    queryKey: ['communications', 'announcements'],
    queryFn: () => communicationApi.getAnnouncements(0, 30),
    enabled: tab === 'announcements',
  });

  const inbox = useQuery({
    queryKey: ['communications', 'inbox'],
    queryFn: () => communicationApi.getInbox(0, 30),
    enabled: tab === 'messages',
  });

  const active = tab === 'announcements' ? announcements : inbox;

  return (
    <Screen refreshing={active.isRefetching} onRefresh={active.refetch}>
      <View style={styles.tabs}>
        <TabBtn
          active={tab === 'announcements'}
          label="Annonces"
          onPress={() => setTab('announcements')}
        />
        <TabBtn active={tab === 'messages'} label="Messages" onPress={() => setTab('messages')} />
      </View>

      {tab === 'announcements' ? (
        <AnnouncementsList
          data={announcements.data?.content ?? []}
          isLoading={announcements.isLoading}
          isError={announcements.isError}
          error={announcements.error as Error | null}
          onRetry={announcements.refetch}
          onPress={(id) => nav.navigate('AnnouncementDetail', { id })}
        />
      ) : (
        <MessagesList
          data={inbox.data?.content ?? []}
          isLoading={inbox.isLoading}
          isError={inbox.isError}
          error={inbox.error as Error | null}
          onRetry={inbox.refetch}
          onPress={(id) => nav.navigate('MessageDetail', { id })}
        />
      )}
    </Screen>
  );
}

function TabBtn({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Text onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      {label}
    </Text>
  );
}

function AnnouncementsList({
  data,
  isLoading,
  isError,
  error,
  onRetry,
  onPress,
}: {
  data: AnnouncementDto[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  onPress: (id: number) => void;
}) {
  if (isLoading) return <Loader label="Chargement des annonces…" />;
  if (isError) return <ErrorView message={error?.message} onRetry={onRetry} />;
  if (data.length === 0) {
    return <EmptyState title="Aucune annonce" description="L'école n'a pas publié d'annonces." />;
  }
  return (
    <>
      {data.map((a) => (
        <Card key={a.id} style={styles.card} onPress={() => onPress(a.id)}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons
                name={a.pinned ? 'pin' : 'megaphone-outline'}
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, !a.isRead && styles.unread]} numberOfLines={1}>
                  {a.title}
                </Text>
                {!a.isRead ? <View style={styles.dot} /> : null}
              </View>
              {a.content ? (
                <Text style={styles.preview} numberOfLines={2}>
                  {a.content}
                </Text>
              ) : null}
              <View style={styles.metaRow}>
                <Text style={styles.meta}>
                  {a.authorName ? `${a.authorName} • ` : ''}
                  {formatDate(a.publishedAt ?? a.publishDate)}
                </Text>
                {a.requiresAcknowledgment && !a.acknowledged ? (
                  <Badge label="Accusé requis" tone="warning" />
                ) : null}
              </View>
            </View>
          </View>
        </Card>
      ))}
    </>
  );
}

function MessagesList({
  data,
  isLoading,
  isError,
  error,
  onRetry,
  onPress,
}: {
  data: MessageDto[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  onPress: (id: number) => void;
}) {
  if (isLoading) return <Loader label="Chargement des messages…" />;
  if (isError) return <ErrorView message={error?.message} onRetry={onRetry} />;
  if (data.length === 0) {
    return (
      <EmptyState title="Boîte vide" description="Vous n'avez aucun message pour le moment." />
    );
  }
  return (
    <>
      {data.map((m) => (
        <Card key={m.id} style={styles.card} onPress={() => onPress(m.id)}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(m.senderName ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, !m.isRead && styles.unread]} numberOfLines={1}>
                  {m.senderName ?? m.senderEmail ?? 'Expéditeur inconnu'}
                </Text>
                {!m.isRead ? <View style={styles.dot} /> : null}
              </View>
              <Text style={[styles.subject, !m.isRead && styles.unread]} numberOfLines={1}>
                {m.subject ?? '(Sans objet)'}
              </Text>
              {m.preview ?? m.body ? (
                <Text style={styles.preview} numberOfLines={1}>
                  {m.preview ?? m.body}
                </Text>
              ) : null}
              <Text style={styles.meta}>{formatDate(m.receivedAt ?? m.sentAt)}</Text>
            </View>
            {m.isStarred ? <Ionicons name="star" size={16} color={colors.warning} /> : null}
          </View>
        </Card>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing.md,
    ...typography.bodyBold,
    color: colors.textSecondary,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  tabActive: { backgroundColor: colors.surface, color: colors.text },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.bodyBold, color: '#FFF' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.body, color: colors.text, flex: 1 },
  subject: { ...typography.body, color: colors.text, marginTop: 2 },
  unread: { fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  preview: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  meta: { ...typography.small, color: colors.textMuted },
});
