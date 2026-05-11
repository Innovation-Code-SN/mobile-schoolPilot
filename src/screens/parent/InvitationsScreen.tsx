import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { parentApi } from '../../api/parentApi';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorView,
  Input,
  Loader,
  Screen,
  SectionHeader,
} from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { ParentInvitation } from '../../types/parent';
import { formatDate } from '../../utils/format';
import { invitationStatusLabel, invitationStatusTone } from '../../utils/status';

type Tab = 'sent' | 'received';

export function InvitationsScreen() {
  const [tab, setTab] = useState<Tab>('received');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const qc = useQueryClient();

  const sent = useQuery({
    queryKey: ['parent', 'invitations', 'sent'],
    queryFn: parentApi.getSentInvitations,
  });

  const received = useQuery({
    queryKey: ['parent', 'invitations', 'received'],
    queryFn: parentApi.getReceivedInvitations,
  });

  const acceptMutation = useMutation({
    mutationFn: (token: string) => parentApi.acceptInvitation(token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['parent', 'invitations'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (token: string) => parentApi.rejectInvitation(token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['parent', 'invitations'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => parentApi.cancelInvitation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['parent', 'invitations'] }),
  });

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un email');
      return;
    }
    setSending(true);
    try {
      await parentApi.sendInvitation({
        recipientEmail: email.trim(),
        recipientName: name.trim() || undefined,
      });
      setEmail('');
      setName('');
      await qc.invalidateQueries({ queryKey: ['parent', 'invitations', 'sent'] });
      Alert.alert('Succès', 'Invitation envoyée');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? 'Échec de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const active = tab === 'sent' ? sent : received;

  return (
    <Screen refreshing={active.isRefetching} onRefresh={active.refetch}>
      <SectionHeader title="Inviter un co-parent" />
      <Card style={styles.inviteCard}>
        <Input
          label="Email du destinataire"
          value={email}
          onChangeText={setEmail}
          placeholder="coparent@exemple.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Nom (optionnel)"
          value={name}
          onChangeText={setName}
          placeholder="Jean Dupont"
        />
        <Button label="Envoyer l'invitation" loading={sending} onPress={handleSend} fullWidth />
      </Card>

      <View style={styles.tabs}>
        <Text
          onPress={() => setTab('received')}
          style={[styles.tab, tab === 'received' && styles.tabActive]}
        >
          Reçues ({received.data?.length ?? 0})
        </Text>
        <Text
          onPress={() => setTab('sent')}
          style={[styles.tab, tab === 'sent' && styles.tabActive]}
        >
          Envoyées ({sent.data?.length ?? 0})
        </Text>
      </View>

      {active.isLoading ? (
        <Loader />
      ) : active.isError ? (
        <ErrorView
          message={(active.error as Error)?.message}
          onRetry={active.refetch}
        />
      ) : !active.data || active.data.length === 0 ? (
        <EmptyState
          title={tab === 'received' ? 'Aucune invitation reçue' : 'Aucune invitation envoyée'}
        />
      ) : (
        active.data.map((inv) => (
          <InvitationCard
            key={inv.id}
            invitation={inv}
            tab={tab}
            onAccept={() => inv.token && acceptMutation.mutate(inv.token)}
            onReject={() => inv.token && rejectMutation.mutate(inv.token)}
            onCancel={() => cancelMutation.mutate(inv.id)}
          />
        ))
      )}
    </Screen>
  );
}

function InvitationCard({
  invitation,
  tab,
  onAccept,
  onReject,
  onCancel,
}: {
  invitation: ParentInvitation;
  tab: Tab;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
}) {
  const isPending = invitation.status?.toUpperCase() === 'PENDING';

  return (
    <Card style={styles.invCard}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.invTitle}>
            {tab === 'sent'
              ? invitation.recipientName || invitation.recipientEmail
              : invitation.senderName || invitation.senderEmail}
          </Text>
          <Text style={styles.invMeta}>
            {tab === 'sent' ? invitation.recipientEmail : invitation.senderEmail}
          </Text>
          {invitation.childName ? (
            <Text style={styles.invMeta}>Enfant : {invitation.childName}</Text>
          ) : null}
          <Text style={styles.invMeta}>Envoyée le {formatDate(invitation.createdAt)}</Text>
        </View>
        <Badge
          label={invitation.statusLabel ?? invitationStatusLabel(invitation.status)}
          tone={invitationStatusTone(invitation.status)}
        />
      </View>

      {isPending && tab === 'received' ? (
        <View style={styles.actions}>
          <Button label="Refuser" variant="secondary" size="sm" onPress={onReject} style={{ flex: 1 }} />
          <Button label="Accepter" size="sm" onPress={onAccept} style={{ flex: 1 }} />
        </View>
      ) : null}

      {isPending && tab === 'sent' ? (
        <Button label="Annuler" variant="ghost" size="sm" onPress={onCancel} style={styles.cancelBtn} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  inviteCard: { marginBottom: spacing.lg },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  tabActive: { backgroundColor: colors.surface, color: colors.text },
  invCard: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  invTitle: { ...typography.bodyBold, color: colors.text },
  invMeta: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  cancelBtn: { alignSelf: 'flex-end', marginTop: spacing.sm },
});
