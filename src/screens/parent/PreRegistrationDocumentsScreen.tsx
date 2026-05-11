import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
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
import type { PreRegistrationsStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';
import { formatDate } from '../../utils/format';

type DocRoute = RouteProp<PreRegistrationsStackParamList, 'PreRegistrationDocuments'>;

const DOCUMENT_TYPES = [
  { value: 'BIRTH_CERTIFICATE', label: 'Acte de naissance' },
  { value: 'ID_CARD', label: "Pièce d'identité" },
  { value: 'SCHOOL_RECORD', label: 'Bulletin scolaire' },
  { value: 'MEDICAL_CERTIFICATE', label: 'Certificat médical' },
  { value: 'PHOTO', label: 'Photo d\'identité' },
  { value: 'OTHER', label: 'Autre' },
];

export function PreRegistrationDocumentsScreen() {
  const { params } = useRoute<DocRoute>();
  const qc = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>('BIRTH_CERTIFICATE');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['parent', 'preregistration-docs', params.preRegistrationId],
    queryFn: () => parentApi.getPreRegistrationDocuments(params.preRegistrationId),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: number) =>
      parentApi.deletePreRegistrationDocument(params.preRegistrationId, docId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['parent', 'preregistration-docs', params.preRegistrationId],
      });
    },
  });

  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    setUploading(true);
    try {
      await parentApi.uploadPreRegistrationDocument(
        params.preRegistrationId,
        {
          uri: asset.uri,
          name: asset.name ?? 'document',
          mimeType: asset.mimeType ?? 'application/octet-stream',
        },
        selectedType,
        notes.trim() || undefined
      );
      setNotes('');
      await qc.invalidateQueries({
        queryKey: ['parent', 'preregistration-docs', params.preRegistrationId],
      });
      Alert.alert('Succès', 'Document envoyé avec succès');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? 'Échec de l\'envoi du document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (docId: number, name: string) => {
    Alert.alert('Supprimer le document', `Supprimer « ${name} » ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(docId),
      },
    ]);
  };

  if (isLoading) {
    return (
      <Screen>
        <Loader label="Chargement des documents…" />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <ErrorView message={(error as Error)?.message} onRetry={() => refetch()} />
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <SectionHeader title="Ajouter un document" />
      <Card style={styles.uploadCard}>
        <Text style={styles.label}>Type de document</Text>
        <View style={styles.typeRow}>
          {DOCUMENT_TYPES.map((t) => {
            const active = t.value === selectedType;
            return (
              <Text
                key={t.value}
                onPress={() => setSelectedType(t.value)}
                style={[styles.typeChip, active && styles.typeChipActive]}
              >
                {t.label}
              </Text>
            );
          })}
        </View>

        <Input
          label="Notes (optionnel)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Remarques éventuelles"
          multiline
        />

        <Button
          label="Sélectionner un fichier"
          loading={uploading}
          onPress={handlePick}
          icon={<Ionicons name="cloud-upload-outline" size={18} color="#FFF" />}
          fullWidth
        />
      </Card>

      <SectionHeader
        title="Documents déposés"
        subtitle={`${data?.length ?? 0} document(s)`}
      />

      {!data || data.length === 0 ? (
        <EmptyState
          title="Aucun document"
          description="Téléversez vos pièces justificatives ci-dessus."
        />
      ) : (
        data.map((doc) => (
          <Card key={doc.id} style={styles.docCard}>
            <View style={styles.docHeader}>
              <View style={styles.docIcon}>
                <Ionicons name="document-text" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{doc.fileName}</Text>
                <Text style={styles.docMeta}>
                  {doc.documentTypeLabel ?? doc.documentType} •{' '}
                  {formatDate(doc.uploadDate)}
                </Text>
              </View>
              {doc.status ? (
                <Badge
                  label={doc.statusLabel ?? doc.status}
                  tone={
                    doc.status.toUpperCase() === 'VALIDATED'
                      ? 'success'
                      : doc.status.toUpperCase() === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                  }
                />
              ) : null}
            </View>
            {doc.notes ? <Text style={styles.docNotes}>{doc.notes}</Text> : null}
            <Button
              label="Supprimer"
              variant="ghost"
              size="sm"
              onPress={() => handleDelete(doc.id, doc.fileName)}
              style={styles.deleteBtn}
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  uploadCard: { marginBottom: spacing.lg },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  typeChip: {
    ...typography.small,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  typeChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    color: colors.primary,
    fontWeight: '600',
  },
  docCard: { marginBottom: spacing.sm },
  docHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: { ...typography.bodyBold, color: colors.text },
  docMeta: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  docNotes: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  deleteBtn: { alignSelf: 'flex-end', marginTop: spacing.xs },
});
