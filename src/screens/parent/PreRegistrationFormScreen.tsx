import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { parentApi } from '../../api/parentApi';
import {
  Button,
  Card,
  Checkbox,
  DateField,
  ErrorView,
  Input,
  Loader,
  Screen,
  SectionHeader,
  Select,
  type SelectOption,
} from '../../components/ui';
import { BLOOD_TYPES, GENDERS, PARENT_RELATIONS } from '../../config/enums';
import type { PreRegistrationsStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import type {
  Gender,
  ParentRelation,
  PreRegistrationFormData,
} from '../../types/preRegistration';

type FormRoute = RouteProp<PreRegistrationsStackParamList, 'PreRegistrationForm'>;
type Nav = NativeStackNavigationProp<PreRegistrationsStackParamList, 'PreRegistrationForm'>;

type Errors = Partial<Record<keyof PreRegistrationFormData, string>>;

const INITIAL: PreRegistrationFormData = {
  studentFirstName: '',
  studentLastName: '',
  studentGender: 'MALE',
  studentDateOfBirth: '',
  studentPlaceOfBirth: '',
  studentNationality: 'Sénégalaise',
  studentPreviousSchool: '',
  studentPreviousClass: '',
  parentRelation: 'FATHER',
  transportationNeeded: false,
  canteenSubscription: false,
  selectedServiceIds: [],
  medicalIntake: {},
  specialNeeds: '',
  additionalComments: '',
};

export function PreRegistrationFormScreen() {
  const { params } = useRoute<FormRoute>();
  const nav = useNavigation<Nav>();
  const isEdit = !!params?.preRegistrationId;

  const [form, setForm] = useState<PreRegistrationFormData>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const yearsQuery = useQuery({
    queryKey: ['parent', 'academic-years'],
    queryFn: parentApi.getAcademicYears,
  });

  const levelsQuery = useQuery({
    queryKey: ['parent', 'levels'],
    queryFn: parentApi.getAvailableLevels,
  });

  const servicesQuery = useQuery({
    queryKey: ['parent', 'available-services'],
    queryFn: parentApi.getAvailableServices,
  });

  const detailQuery = useQuery({
    queryKey: ['parent', 'preregistration', params?.preRegistrationId],
    queryFn: () => parentApi.getPreRegistrationDetails(params!.preRegistrationId!),
    enabled: isEdit,
  });

  // Pré-remplir l'année active
  useEffect(() => {
    if (!isEdit && yearsQuery.data && !form.academicYearId) {
      const active = yearsQuery.data.find((y) => y.isActive);
      if (active) setForm((prev) => ({ ...prev, academicYearId: active.id }));
    }
  }, [yearsQuery.data, isEdit, form.academicYearId]);

  // Hydrater le form en édition
  useEffect(() => {
    if (isEdit && detailQuery.data) {
      const d = detailQuery.data;
      setForm({
        studentFirstName: d.studentFirstName ?? '',
        studentLastName: d.studentLastName ?? '',
        studentGender: (d.studentGender as Gender) ?? 'MALE',
        studentDateOfBirth: d.studentDateOfBirth ?? '',
        studentPlaceOfBirth: d.studentPlaceOfBirth ?? '',
        studentNationality: d.studentNationality ?? 'Sénégalaise',
        studentPreviousSchool: d.studentPreviousSchool ?? '',
        studentPreviousClass: d.studentPreviousClass ?? '',
        requestedLevel: d.requestedLevel ?? '',
        academicYearId: d.academicYearId,
        parentRelation: (d.parentRelation as ParentRelation) ?? 'FATHER',
        transportationNeeded: d.transportationNeeded ?? false,
        canteenSubscription: d.canteenSubscription ?? false,
        selectedServiceIds: d.selectedServices?.map((s) => s.serviceId) ?? [],
        medicalIntake: d.medicalIntake ?? {},
        specialNeeds: d.specialNeeds ?? '',
        additionalComments: d.additionalComments ?? '',
      });
    }
  }, [isEdit, detailQuery.data]);

  const yearOptions = useMemo<SelectOption<number>[]>(
    () =>
      (yearsQuery.data ?? []).map((y) => ({
        value: y.id,
        label: y.libelle,
        description: y.isActive ? 'Année en cours' : undefined,
      })),
    [yearsQuery.data]
  );

  const optionalServices = useMemo(
    () =>
      (servicesQuery.data ?? [])
        .filter((s) => s.isActive && s.category !== 'MANDATORY' && s.availableAtPreRegistration !== false)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [servicesQuery.data]
  );

  const levelOptions = useMemo<SelectOption<string>[]>(
    () =>
      (levelsQuery.data ?? [])
        .filter((l) => l.isActive !== false)
        .map((l) => ({
          value: l.libelle,
          label: l.libelle,
          description: l.cycle?.libelle,
        })),
    [levelsQuery.data]
  );

  const set = <K extends keyof PreRegistrationFormData>(
    key: K,
    value: PreRegistrationFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /**
   * Met à jour un sous-champ du bloc médical (medicalIntake).
   * Le bloc complet est ensuite envoyé en JSON via le DTO de pré-inscription.
   */
  const setIntake = (patch: Partial<NonNullable<PreRegistrationFormData['medicalIntake']>>) => {
    setForm((prev) => ({
      ...prev,
      medicalIntake: { ...(prev.medicalIntake ?? {}), ...patch },
    }));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.studentFirstName.trim()) e.studentFirstName = 'Prénom requis';
    if (!form.studentLastName.trim()) e.studentLastName = 'Nom requis';
    if (!form.studentDateOfBirth) e.studentDateOfBirth = 'Date de naissance requise';
    if (!form.studentPlaceOfBirth.trim()) e.studentPlaceOfBirth = 'Lieu de naissance requis';
    if (!form.academicYearId) e.academicYearId = 'Année scolaire requise';
    if (!form.requestedLevel) e.requestedLevel = 'Niveau requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Champs manquants', 'Veuillez compléter les champs obligatoires.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit && params?.preRegistrationId) {
        await parentApi.updatePreRegistration(params.preRegistrationId, form);
        Alert.alert('Succès', 'Préinscription modifiée', [
          { text: 'OK', onPress: () => nav.goBack() },
        ]);
      } else {
        await parentApi.createPreRegistration(form);
        Alert.alert(
          'Préinscription envoyée',
          'Votre demande a bien été enregistrée. Vous pourrez suivre son statut dans la liste.',
          [
            {
              text: 'OK',
              onPress: () => nav.navigate('PreRegistrationsList'),
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Erreur', err?.message ?? 'Échec de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && detailQuery.isLoading) {
    return (
      <Screen>
        <Loader label="Chargement de la préinscription…" />
      </Screen>
    );
  }
  if (isEdit && detailQuery.isError) {
    return (
      <Screen>
        <ErrorView
          message={(detailQuery.error as Error)?.message}
          onRetry={() => detailQuery.refetch()}
        />
      </Screen>
    );
  }

  const maxBirthDate = new Date();

  return (
    <Screen>
      <SectionHeader title="Informations de l'élève" />
      <Card style={styles.card}>
        <Input
          label="Prénom *"
          value={form.studentFirstName}
          onChangeText={(v) => set('studentFirstName', v)}
          error={errors.studentFirstName}
        />
        <Input
          label="Nom *"
          value={form.studentLastName}
          onChangeText={(v) => set('studentLastName', v)}
          error={errors.studentLastName}
        />
        <Select
          label="Genre *"
          value={form.studentGender}
          options={GENDERS}
          onChange={(v) => set('studentGender', v)}
        />
        <DateField
          label="Date de naissance *"
          value={form.studentDateOfBirth}
          onChange={(v) => set('studentDateOfBirth', v)}
          error={errors.studentDateOfBirth}
          maximumDate={maxBirthDate}
        />
        <Input
          label="Lieu de naissance *"
          value={form.studentPlaceOfBirth}
          onChangeText={(v) => set('studentPlaceOfBirth', v)}
          error={errors.studentPlaceOfBirth}
          placeholder="Ville, Pays"
        />
        <Input
          label="Nationalité"
          value={form.studentNationality}
          onChangeText={(v) => set('studentNationality', v)}
        />
      </Card>

      <SectionHeader title="Informations scolaires" />
      <Card style={styles.card}>
        <Select
          label="Année scolaire *"
          value={form.academicYearId}
          options={yearOptions}
          onChange={(v) => set('academicYearId', v)}
          error={errors.academicYearId}
          placeholder={yearsQuery.isLoading ? 'Chargement…' : 'Sélectionner'}
          disabled={yearsQuery.isLoading}
        />
        <Select
          label="Niveau souhaité *"
          value={form.requestedLevel}
          options={levelOptions}
          onChange={(v) => set('requestedLevel', v)}
          error={errors.requestedLevel}
          placeholder={levelsQuery.isLoading ? 'Chargement…' : 'Sélectionner'}
          disabled={levelsQuery.isLoading}
        />
        <Input
          label="École précédente"
          value={form.studentPreviousSchool ?? ''}
          onChangeText={(v) => set('studentPreviousSchool', v)}
        />
        <Input
          label="Classe précédente"
          value={form.studentPreviousClass ?? ''}
          onChangeText={(v) => set('studentPreviousClass', v)}
          placeholder="Ex : CM2, 6ème…"
        />
      </Card>

      <SectionHeader title="Lien de parenté" />
      <Card style={styles.card}>
        <Select
          label="Vous êtes"
          value={form.parentRelation}
          options={PARENT_RELATIONS}
          onChange={(v) => set('parentRelation', v)}
        />
      </Card>

      <SectionHeader
        title="Services optionnels"
        subtitle="Sélectionnez les services souhaités"
      />
      <Card style={styles.card}>
        {servicesQuery.isLoading ? (
          <Loader label="Chargement des services…" />
        ) : optionalServices.length > 0 ? (
          <>
            {optionalServices.map((service) => {
              const selected = form.selectedServiceIds?.includes(service.id) ?? false;
              return (
                <Checkbox
                  key={service.id}
                  value={selected}
                  onChange={(checked) => {
                    const ids = form.selectedServiceIds ?? [];
                    set(
                      'selectedServiceIds',
                      checked
                        ? [...ids, service.id]
                        : ids.filter((id) => id !== service.id)
                    );
                  }}
                  label={service.name}
                  description={service.description}
                />
              );
            })}
          </>
        ) : (
          <>
            <Checkbox
              value={!!form.transportationNeeded}
              onChange={(v) => set('transportationNeeded', v)}
              label="Transport scolaire"
              description="Ramassage en bus matin/soir"
            />
            <Checkbox
              value={!!form.canteenSubscription}
              onChange={(v) => set('canteenSubscription', v)}
              label="Cantine scolaire"
              description="Restauration sur place le midi"
            />
          </>
        )}
      </Card>

      <SectionHeader
        title="Bloc médical (optionnel)"
        subtitle="Vous pourrez compléter le dossier complet après validation."
      />
      <Card style={styles.card}>
        <Select
          label="Groupe sanguin"
          value={form.medicalIntake?.bloodType ?? ''}
          options={[{ value: '', label: 'Non renseigné' }, ...BLOOD_TYPES]}
          onChange={(v) => setIntake({ bloodType: v || undefined })}
        />
        <Input
          label="Médecin traitant"
          value={form.medicalIntake?.primaryDoctorName ?? ''}
          onChangeText={(v) => setIntake({ primaryDoctorName: v })}
        />
        <Input
          label="Téléphone du médecin"
          keyboardType="phone-pad"
          value={form.medicalIntake?.primaryDoctorPhone ?? ''}
          onChangeText={(v) => setIntake({ primaryDoctorPhone: v })}
        />
        <Input
          label="Hôpital préféré"
          value={form.medicalIntake?.preferredHospital ?? ''}
          onChangeText={(v) => setIntake({ preferredHospital: v })}
        />
        <Input
          label="N° sécurité sociale"
          value={form.medicalIntake?.socialSecurityNumber ?? ''}
          onChangeText={(v) => setIntake({ socialSecurityNumber: v })}
        />
      </Card>

      <SectionHeader title="Assurance santé (optionnel)" />
      <Card style={styles.card}>
        <Input
          label="Mutuelle / Compagnie d'assurance"
          value={form.medicalIntake?.insuranceProvider ?? ''}
          onChangeText={(v) => setIntake({ insuranceProvider: v })}
        />
        <Input
          label="N° police / adhérent"
          value={form.medicalIntake?.insurancePolicyNumber ?? ''}
          onChangeText={(v) => setIntake({ insurancePolicyNumber: v })}
        />
        <Input
          label="Date d'expiration (YYYY-MM-DD)"
          value={form.medicalIntake?.insuranceExpiryDate ?? ''}
          onChangeText={(v) => setIntake({ insuranceExpiryDate: v || undefined })}
        />
        <Input
          label="Téléphone urgence assurance"
          keyboardType="phone-pad"
          value={form.medicalIntake?.insurancePhone ?? ''}
          onChangeText={(v) => setIntake({ insurancePhone: v })}
        />
      </Card>

      <SectionHeader title="Besoins spécifiques (optionnel)" />
      <Card style={styles.card}>
        <Input
          label="Besoins spécifiques"
          value={form.specialNeeds ?? ''}
          onChangeText={(v) => set('specialNeeds', v)}
          multiline
          numberOfLines={3}
          placeholder="Handicap, régime alimentaire, aménagements…"
        />
      </Card>

      <SectionHeader title="Commentaires" />
      <Card style={styles.card}>
        <Input
          label="Commentaires additionnels"
          value={form.additionalComments ?? ''}
          onChangeText={(v) => set('additionalComments', v)}
          multiline
          numberOfLines={4}
          placeholder="Toute information utile…"
        />
      </Card>

      <View style={styles.actions}>
        <Button label="Annuler" variant="secondary" onPress={() => nav.goBack()} style={{ flex: 1 }} />
        <Button
          label={isEdit ? 'Enregistrer' : 'Soumettre'}
          loading={saving}
          onPress={handleSubmit}
          style={{ flex: 1 }}
        />
      </View>

      <Text style={styles.hint}>
        Les champs marqués d'un * sont obligatoires. Vous pourrez ajouter des documents après la
        création.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
