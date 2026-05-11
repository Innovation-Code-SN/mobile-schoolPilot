import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { communicationApi } from '../../api/communicationApi';
import {
  Badge,
  Button,
  Card,
  ErrorView,
  Loader,
  Screen,
} from '../../components/ui';
import type { CommunicationsStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { formatDate } from '../../utils/format';

type Route = RouteProp<CommunicationsStackParamList, 'AnnouncementDetail'>;

export function AnnouncementDetailScreen() {
  const { params } = useRoute<Route>();
  const qc = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['announcement', params.id],
    queryFn: () => communicationApi.getAnnouncement(params.id),
  });

  // Marquer comme lu automatiquement
  useEffect(() => {
    if (data && !data.isRead) {
      communicationApi.markAnnouncementRead(params.id).catch(() => {
        // ignore
      });
      qc.invalidateQueries({ queryKey: ['communications', 'announcements'] });
    }
  }, [data, params.id, qc]);

  const ackMutation = useMutation({
    mutationFn: () => communicationApi.acknowledgeAnnouncement(params.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcement', params.id] });
      qc.invalidateQueries({ queryKey: ['communications', 'announcements'] });
    },
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
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          {data.pinned ? <Badge label="Épinglée" tone="primary" /> : null}
          {data.categoryLabel ? <Badge label={data.categoryLabel} tone="info" /> : null}
        </View>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.meta}>
          {data.authorName ? `Par ${data.authorName} • ` : ''}
          {formatDate(data.publishedAt ?? data.publishDate)}
        </Text>
        {data.content ? <Text style={styles.body}>{data.content}</Text> : null}

        {data.requiresAcknowledgment ? (
          data.acknowledged ? (
            <Badge label="Accusé de réception envoyé" tone="success" />
          ) : (
            <Button
              label="Accuser réception"
              onPress={() => ackMutation.mutate()}
              loading={ackMutation.isPending}
              fullWidth
              style={{ marginTop: spacing.lg }}
            />
          )
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {},
  headerRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  meta: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  body: { ...typography.body, color: colors.text, lineHeight: 24 },
});
