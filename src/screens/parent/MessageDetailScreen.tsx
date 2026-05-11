import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { communicationApi } from '../../api/communicationApi';
import { Card, ErrorView, Loader, Screen } from '../../components/ui';
import type { CommunicationsStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import type { MessageDto } from '../../types/communication';
import { formatDate } from '../../utils/format';

type Route = RouteProp<CommunicationsStackParamList, 'MessageDetail'>;

export function MessageDetailScreen() {
  const { params } = useRoute<Route>();
  const qc = useQueryClient();

  const messageQuery = useQuery({
    queryKey: ['message', params.id],
    queryFn: () => communicationApi.getMessage(params.id),
  });

  const threadQuery = useQuery({
    queryKey: ['message-thread', params.id],
    queryFn: () => communicationApi.getMessageThread(params.id),
    enabled: !!messageQuery.data?.threadId,
  });

  useEffect(() => {
    if (messageQuery.data && !messageQuery.data.isRead) {
      communicationApi.markMessageRead(params.id).catch(() => {});
      qc.invalidateQueries({ queryKey: ['communications', 'inbox'] });
    }
  }, [messageQuery.data, params.id, qc]);

  if (messageQuery.isLoading) {
    return (
      <Screen>
        <Loader label="Chargement…" />
      </Screen>
    );
  }
  if (messageQuery.isError || !messageQuery.data) {
    return (
      <Screen>
        <ErrorView
          message={(messageQuery.error as Error)?.message}
          onRetry={() => messageQuery.refetch()}
        />
      </Screen>
    );
  }

  const thread = threadQuery.data ?? [messageQuery.data];

  return (
    <Screen>
      <Text style={styles.subject}>{messageQuery.data.subject ?? '(Sans objet)'}</Text>
      {thread.map((m) => (
        <MessageCard key={m.id} message={m} />
      ))}
    </Screen>
  );
}

function MessageCard({ message }: { message: MessageDto }) {
  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(message.senderName ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.from}>{message.senderName ?? message.senderEmail ?? '—'}</Text>
          {message.senderEmail && message.senderEmail !== message.senderName ? (
            <Text style={styles.email}>{message.senderEmail}</Text>
          ) : null}
        </View>
        <Text style={styles.date}>{formatDate(message.receivedAt ?? message.sentAt)}</Text>
      </View>
      {message.body ? <Text style={styles.body}>{message.body}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  subject: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.bodyBold, color: '#FFF' },
  from: { ...typography.bodyBold, color: colors.text },
  email: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  date: { ...typography.small, color: colors.textMuted },
  body: { ...typography.body, color: colors.text, lineHeight: 22 },
});
