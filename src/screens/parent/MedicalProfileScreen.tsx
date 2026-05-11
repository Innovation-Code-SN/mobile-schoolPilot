// src/screens/parent/MedicalProfileScreen.tsx
// Dossier médical de l'enfant côté parent.
// Le parent peut consulter ET :
//   - activer/refuser les autorisations parentales (toggle)
//   - compléter le profil principal (modal d'édition)
//   - ajouter un contact d'urgence
// Pour les éditions plus complexes (conditions, traitements, etc.), on
// renvoie vers le portail web — l'app mobile reste compacte.
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { medicalApi } from '../../api/medicalApi';
import {
  Badge,
  Button,
  Card,
  DateField,
  ErrorView,
  Input,
  Loader,
  Screen,
  SectionHeader,
  Select,
} from '../../components/ui';
import type { ChildrenStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';
import {
  MEDICAL_CONDITION_SEVERITY_LABELS,
  MEDICAL_CONTACT_TYPE_LABELS,
  type MedicalContactType,
  type StudentMedicalContact,
  type StudentMedicalProfile,
} from '../../types/medical';

type Route = RouteProp<ChildrenStackParamList, 'MedicalProfile'>;

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function MedicalProfileScreen() {
  const { params } = useRoute<Route>();
  const childId = params.childId;
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['parent', 'medical-profile', childId],
    queryFn: () => medicalApi.getChildMedicalProfile(childId),
  });

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // ---------- Mutation : autorisation toggle ----------
  const authMutation = useMutation({
    mutationFn: (input: { authorizationId: number; granted: boolean }) =>
      medicalApi.setAuthorization(childId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent', 'medical-profile', childId] });
    },
    onError: (err: Error) => {
      Alert.alert('Erreur', err.message ?? "Impossible d'enregistrer l'autorisation");
    },
  });

  if (query.isLoading) {
    return (
      <Screen>
        <Loader label="Chargement du dossier médical…" />
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen>
        <ErrorView
          message={(query.error as Error)?.message ?? 'Dossier médical indisponible'}
          onRetry={query.refetch}
        />
      </Screen>
    );
  }

  const data = query.data;
  const profile = data.profile;

  return (
    <>
      <Screen refreshing={query.isRefetching} onRefresh={query.refetch}>
        <Card style={styles.hero}>
          <Text style={styles.heroTitle}>Dossier médical</Text>
          <Text style={styles.heroSub}>{data.studentFullName}</Text>
        </Card>

        {/* Profil principal */}
        <SectionHeader
          title="Informations générales"
          right={
            <Button
              variant="secondary"
              size="sm"
              label={profile ? 'Modifier' : 'Compléter'}
              onPress={() => setProfileModalOpen(true)}
            />
          }
        />
        <Card style={styles.card}>
          <Row label="Groupe sanguin" value={profile?.bloodType} />
          <Row label="Taille" value={profile?.heightCm ? `${profile.heightCm} cm` : undefined} />
          <Row label="Poids" value={profile?.weightKg ? `${profile.weightKg} kg` : undefined} />
          <Row label="Médecin traitant" value={profile?.primaryDoctorName} />
          <Row label="Tél. médecin" value={profile?.primaryDoctorPhone} />
          <Row
            label="Hôpital préféré"
            value={profile?.preferredFacilityName ?? profile?.preferredHospital}
          />
          <Row label="N° sécurité sociale" value={profile?.socialSecurityNumber} last />
        </Card>

        {/* Assurance santé */}
        {(profile?.insuranceProvider ||
          profile?.insurancePolicyNumber ||
          profile?.insuranceExpiryDate ||
          profile?.insurancePhone) && (
          <>
            <SectionHeader title="Assurance santé" />
            <Card style={styles.card}>
              <Row label="Mutuelle" value={profile?.insuranceProvider} />
              <Row label="N° police" value={profile?.insurancePolicyNumber} />
              <Row label="Expiration" value={profile?.insuranceExpiryDate} />
              <Row label="Tél. urgence" value={profile?.insurancePhone} last />
            </Card>
          </>
        )}

        {/* Allergies / maladies */}
        <SectionHeader
          title={`Allergies, maladies, handicaps (${data.conditions.length})`}
        />
        {data.conditions.length === 0 ? (
          <EmptyHint text="Aucune condition signalée. Pour en ajouter, utilisez le portail web." />
        ) : (
          data.conditions.map((c) => (
            <Card key={c.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{c.conditionName}</Text>
                {c.severity && (
                  <Badge
                    label={MEDICAL_CONDITION_SEVERITY_LABELS[c.severity]}
                    tone={c.severity === 'CRITICAL' || c.severity === 'SEVERE' ? 'danger'
                      : c.severity === 'MODERATE' ? 'warning' : 'success'}
                  />
                )}
              </View>
              {c.conditionTypeName && (
                <Text style={styles.itemSub}>{c.conditionTypeName}</Text>
              )}
              {c.notes && <Text style={styles.itemNotes}>{c.notes}</Text>}
            </Card>
          ))
        )}

        {/* Traitements */}
        <SectionHeader title={`Traitements en cours (${data.medications.length})`} />
        {data.medications.length === 0 ? (
          <EmptyHint text="Aucun traitement renseigné. Pour en ajouter, utilisez le portail web." />
        ) : (
          data.medications.map((m) => (
            <Card key={m.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{m.medicationName}</Text>
                {m.active === false && <Badge label="Terminé" tone="neutral" />}
              </View>
              {(m.dosage || m.frequency) && (
                <Text style={styles.itemSub}>
                  {m.dosage}{m.dosage && m.frequency ? ' · ' : ''}{m.frequency}
                </Text>
              )}
              {m.prescriber && <Text style={styles.itemSub}>Prescrit par {m.prescriber}</Text>}
              {m.notes && <Text style={styles.itemNotes}>{m.notes}</Text>}
            </Card>
          ))
        )}

        {/* Vaccinations */}
        <SectionHeader title={`Carnet vaccinal (${data.vaccinations.length})`} />
        {data.vaccinations.length === 0 ? (
          <EmptyHint text="Aucune vaccination enregistrée." />
        ) : (
          data.vaccinations.map((v) => (
            <Card key={v.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{v.vaccineName}</Text>
              {v.administrationDate && (
                <Text style={styles.itemSub}>Administré le {v.administrationDate}</Text>
              )}
              {v.nextBoosterDate && (
                <Text style={styles.itemSub}>Rappel : {v.nextBoosterDate}</Text>
              )}
            </Card>
          ))
        )}

        {/* Contacts médicaux */}
        <SectionHeader
          title={`Contacts d'urgence et médicaux (${data.contacts.length})`}
          right={
            <Button
              variant="secondary"
              size="sm"
              label="Ajouter"
              onPress={() => setContactModalOpen(true)}
            />
          }
        />
        {data.contacts.length === 0 ? (
          <EmptyHint text="Aucun contact enregistré." />
        ) : (
          data.contacts.map((c) => (
            <Card key={c.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{c.fullName}</Text>
                <Badge label={MEDICAL_CONTACT_TYPE_LABELS[c.contactType]} tone="neutral" />
              </View>
              {c.relationship && <Text style={styles.itemSub}>{c.relationship}</Text>}
              {c.phonePrimary && <Text style={styles.itemSub}>Tél. : {c.phonePrimary}</Text>}
              {c.email && <Text style={styles.itemSub}>{c.email}</Text>}
            </Card>
          ))
        )}

        {/* Autorisations parentales : toggle on/off */}
        {data.authorizations.length > 0 && (
          <>
            <SectionHeader
              title="Autorisations parentales"
              subtitle="Activez ou refusez chaque autorisation."
            />
            {data.authorizations.map((a) => (
              <Card key={a.authorizationId} style={styles.itemCard}>
                <View style={styles.authRow}>
                  <View style={styles.authInfo}>
                    <Text style={styles.itemTitle}>{a.authorizationName}</Text>
                    {a.authorizationDescription && (
                      <Text style={styles.itemSub}>{a.authorizationDescription}</Text>
                    )}
                  </View>
                  <Switch
                    value={a.granted}
                    onValueChange={(value) =>
                      authMutation.mutate({
                        authorizationId: a.authorizationId,
                        granted: value,
                      })
                    }
                    trackColor={{ true: colors.primary, false: colors.border }}
                    disabled={authMutation.isPending}
                  />
                </View>
                <Text
                  style={[
                    styles.authStatus,
                    { color: a.granted ? colors.success : colors.danger },
                  ]}
                >
                  {a.granted ? '✓ Autorisée' : '✗ Refusée'}
                  {a.grantedAt ? ` · ${a.grantedAt}` : ''}
                </Text>
              </Card>
            ))}
          </>
        )}

        {profile?.additionalNotes && (
          <>
            <SectionHeader title="Notes" />
            <Card style={styles.card}>
              <Text style={styles.notes}>{profile.additionalNotes}</Text>
            </Card>
          </>
        )}

        <View style={{ height: spacing.xl }} />
      </Screen>

      <ProfileEditModal
        visible={profileModalOpen}
        initial={profile}
        onClose={() => setProfileModalOpen(false)}
        onSaved={() => {
          setProfileModalOpen(false);
          qc.invalidateQueries({ queryKey: ['parent', 'medical-profile', childId] });
        }}
        childId={childId}
      />

      <ContactAddModal
        visible={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSaved={() => {
          setContactModalOpen(false);
          qc.invalidateQueries({ queryKey: ['parent', 'medical-profile', childId] });
        }}
        childId={childId}
      />
    </>
  );
}

// =====================================================================
// Sous-composants
// =====================================================================

function Row({ label, value, last }: { label: string; value?: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <Card style={styles.emptyCard}>
      <Text style={styles.emptyText}>{text}</Text>
    </Card>
  );
}

// ---------- Modal édition profil ----------
function ProfileEditModal({
  visible,
  initial,
  childId,
  onClose,
  onSaved,
}: {
  visible: boolean;
  initial?: StudentMedicalProfile;
  childId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<StudentMedicalProfile>(() => initial ?? {});

  // Synchronise quand on ouvre la modal sur un nouveau profil.
  React.useEffect(() => {
    if (visible) setForm(initial ?? {});
  }, [visible, initial]);

  const mutation = useMutation({
    mutationFn: (payload: StudentMedicalProfile) => medicalApi.upsertProfile(childId, payload),
    onSuccess: () => onSaved(),
    onError: (err: Error) => {
      Alert.alert('Erreur', err.message ?? "Impossible d'enregistrer le profil");
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>
            {initial ? 'Modifier le dossier médical' : 'Compléter le dossier médical'}
          </Text>
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={{ paddingBottom: spacing.lg }}
            keyboardShouldPersistTaps="handled"
          >
            <Select
              label="Groupe sanguin"
              value={form.bloodType ?? ''}
              onChange={(v) => setForm({ ...form, bloodType: v || undefined })}
              options={[
                { value: '', label: 'Non renseigné' },
                ...BLOOD_TYPES.map((t) => ({ value: t, label: t })),
              ]}
            />
            <Input
              label="Taille (cm)"
              keyboardType="numeric"
              value={form.heightCm?.toString() ?? ''}
              onChangeText={(v) =>
                setForm({ ...form, heightCm: v ? parseInt(v, 10) : undefined })
              }
            />
            <Input
              label="Poids (kg)"
              keyboardType="numeric"
              value={form.weightKg?.toString() ?? ''}
              onChangeText={(v) =>
                setForm({ ...form, weightKg: v ? parseFloat(v) : undefined })
              }
            />
            <Input
              label="Médecin traitant"
              value={form.primaryDoctorName ?? ''}
              onChangeText={(v) => setForm({ ...form, primaryDoctorName: v })}
            />
            <Input
              label="Téléphone du médecin"
              keyboardType="phone-pad"
              value={form.primaryDoctorPhone ?? ''}
              onChangeText={(v) => setForm({ ...form, primaryDoctorPhone: v })}
            />
            <Input
              label="Hôpital préféré"
              value={form.preferredHospital ?? ''}
              onChangeText={(v) => setForm({ ...form, preferredHospital: v })}
            />
            <Input
              label="N° sécurité sociale"
              value={form.socialSecurityNumber ?? ''}
              onChangeText={(v) => setForm({ ...form, socialSecurityNumber: v })}
            />

            <Text style={styles.modalSubtitle}>Assurance santé</Text>
            <Input
              label="Mutuelle / Compagnie"
              value={form.insuranceProvider ?? ''}
              onChangeText={(v) => setForm({ ...form, insuranceProvider: v })}
            />
            <Input
              label="N° police / adhérent"
              value={form.insurancePolicyNumber ?? ''}
              onChangeText={(v) => setForm({ ...form, insurancePolicyNumber: v })}
            />
            <DateField
              label="Expiration"
              value={form.insuranceExpiryDate ?? undefined}
              onChange={(v) => setForm({ ...form, insuranceExpiryDate: v || undefined })}
            />
            <Input
              label="Téléphone urgence assurance"
              keyboardType="phone-pad"
              value={form.insurancePhone ?? ''}
              onChangeText={(v) => setForm({ ...form, insurancePhone: v })}
            />

            <Input
              label="Notes additionnelles"
              multiline
              numberOfLines={3}
              value={form.additionalNotes ?? ''}
              onChangeText={(v) => setForm({ ...form, additionalNotes: v })}
            />
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button variant="ghost" label="Annuler" onPress={onClose} disabled={mutation.isPending} />
            <Button
              variant="primary"
              label="Enregistrer"
              onPress={() => mutation.mutate(form)}
              loading={mutation.isPending}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------- Modal ajout contact ----------
function ContactAddModal({
  visible,
  childId,
  onClose,
  onSaved,
}: {
  visible: boolean;
  childId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<StudentMedicalContact>({
    contactType: 'EMERGENCY_FAMILY',
    fullName: '',
  });

  React.useEffect(() => {
    if (visible) {
      setForm({ contactType: 'EMERGENCY_FAMILY', fullName: '' });
    }
  }, [visible]);

  const mutation = useMutation({
    mutationFn: (payload: StudentMedicalContact) => medicalApi.addContact(childId, payload),
    onSuccess: () => onSaved(),
    onError: (err: Error) => {
      Alert.alert('Erreur', err.message ?? "Impossible d'ajouter le contact");
    },
  });

  const submit = () => {
    if (!form.fullName.trim()) {
      Alert.alert('Validation', 'Le nom est obligatoire.');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Nouveau contact d'urgence</Text>
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={{ paddingBottom: spacing.lg }}
            keyboardShouldPersistTaps="handled"
          >
            <Select
              label="Type"
              value={form.contactType}
              onChange={(v) =>
                setForm({ ...form, contactType: v as MedicalContactType })
              }
              options={Object.entries(MEDICAL_CONTACT_TYPE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <Input
              label="Nom complet *"
              value={form.fullName}
              onChangeText={(v) => setForm({ ...form, fullName: v })}
            />
            <Input
              label="Téléphone principal"
              keyboardType="phone-pad"
              value={form.phonePrimary ?? ''}
              onChangeText={(v) => setForm({ ...form, phonePrimary: v })}
            />
            <Input
              label="Téléphone secondaire"
              keyboardType="phone-pad"
              value={form.phoneSecondary ?? ''}
              onChangeText={(v) => setForm({ ...form, phoneSecondary: v })}
            />
            <Input
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email ?? ''}
              onChangeText={(v) => setForm({ ...form, email: v })}
            />
            <Input
              label="Lien (père, mère, oncle…)"
              value={form.relationship ?? ''}
              onChangeText={(v) => setForm({ ...form, relationship: v })}
            />
            <Input
              label="Spécialité (médecin)"
              value={form.specialty ?? ''}
              onChangeText={(v) => setForm({ ...form, specialty: v })}
            />
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button variant="ghost" label="Annuler" onPress={onClose} disabled={mutation.isPending} />
            <Button variant="primary" label="Enregistrer" onPress={submit} loading={mutation.isPending} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: spacing.lg, alignItems: 'center' },
  heroTitle: { ...typography.h2, color: colors.text },
  heroSub: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  card: { marginBottom: spacing.sm, padding: 0 },
  itemCard: { marginBottom: spacing.sm, padding: spacing.md },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemTitle: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  itemSub: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  itemNotes: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  emptyCard: { marginBottom: spacing.sm, padding: spacing.md },
  emptyText: { ...typography.caption, color: colors.textSecondary, fontStyle: 'italic' },
  notes: { ...typography.body, color: colors.text, padding: spacing.md, lineHeight: 22 },
  row: { flexDirection: 'row', padding: spacing.md, alignItems: 'center' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  rowValue: { ...typography.body, color: colors.text, flex: 1.4, textAlign: 'right' },

  authRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  authInfo: { flex: 1 },
  authStatus: { ...typography.caption, marginTop: spacing.xs, fontWeight: '500' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '90%',
    paddingTop: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalBody: { paddingHorizontal: spacing.lg },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
