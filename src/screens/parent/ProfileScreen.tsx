import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { parentApi } from '../../api/parentApi';
import {
  Button,
  Card,
  ErrorView,
  Input,
  Loader,
  Screen,
  SectionHeader,
} from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography } from '../../theme';

export function ProfileScreen() {
  const nav = useNavigation();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['parent', 'profile'],
    queryFn: parentApi.getProfile,
  });

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [profession, setProfession] = useState('');

  useEffect(() => {
    if (data) {
      setPhone(data.phone ?? '');
      setAddress(data.address ?? '');
      setCity(data.city ?? '');
      setProfession(data.profession ?? '');
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      parentApi.updateProfile({
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        profession: profession.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent', 'profile'] });
      Alert.alert('Succès', 'Profil mis à jour');
    },
    onError: (e: any) => {
      Alert.alert('Erreur', e?.message ?? 'Échec de la mise à jour');
    },
  });

  if (isLoading) {
    return (
      <Screen>
        <Loader label="Chargement du profil…" />
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
      <Pressable
        onPress={() => (nav.canGoBack() ? nav.goBack() : null)}
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
        <Text style={styles.backLabel}>Retour</Text>
      </Pressable>

      <Card style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(data.firstName?.[0] ?? '?') + (data.lastName?.[0] ?? '')}
          </Text>
        </View>
        <Text style={styles.name}>
          {data.firstName} {data.lastName}
        </Text>
        <Text style={styles.email}>{data.email}</Text>
        {user?.role ? <Text style={styles.role}>{user.roleName ?? user.role}</Text> : null}
      </Card>

      <SectionHeader title="Informations non modifiables" />
      <Card style={styles.card}>
        <ReadOnlyRow label="Email" value={data.email} />
        <ReadOnlyRow label="CIN" value={data.cin ?? '—'} last />
      </Card>

      <SectionHeader title="Informations modifiables" />
      <Card style={styles.card}>
        <Input label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="Adresse" value={address} onChangeText={setAddress} />
        <Input label="Ville" value={city} onChangeText={setCity} />
        <Input label="Profession" value={profession} onChangeText={setProfession} />

        <Button
          label="Enregistrer"
          loading={updateMutation.isPending}
          onPress={() => updateMutation.mutate()}
          fullWidth
        />
      </Card>
    </Screen>
  );
}

function ReadOnlyRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.roRow, !last && styles.roRowBorder]}>
      <Text style={styles.roLabel}>{label}</Text>
      <Text style={styles.roValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  backLabel: { ...typography.bodyBold, color: colors.primary, marginLeft: 2 },
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { ...typography.h1, color: colors.secondary },
  name: { ...typography.h2, color: colors.text },
  email: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  role: {
    ...typography.small,
    color: colors.secondary,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  card: { marginBottom: spacing.md, padding: 0 },
  roRow: { flexDirection: 'row', padding: spacing.md },
  roRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  roLabel: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  roValue: { ...typography.body, color: colors.text, flex: 1.4, textAlign: 'right' },
});
