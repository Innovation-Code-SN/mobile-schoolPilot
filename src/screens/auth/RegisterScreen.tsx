import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { authApi } from '../../api/authApi';
import { Button, Input, Screen } from '../../components/ui';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import type { RegisterParentRequest } from '../../types/preRegistration';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

type Errors = Partial<Record<keyof RegisterParentRequest, string>>;

const PHONE_REGEX = /^(77|78|76|70|75)[0-9]{7}$/;

export function RegisterScreen() {
  const nav = useNavigation<Nav>();
  const [form, setForm] = useState<RegisterParentRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cin: '',
    address: '',
    city: '',
    profession: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof RegisterParentRequest>(key: K, value: RegisterParentRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.firstName.trim() || form.firstName.trim().length < 2)
      e.firstName = 'Prénom requis (min. 2 caractères)';
    if (!form.lastName.trim() || form.lastName.trim().length < 2)
      e.lastName = 'Nom requis (min. 2 caractères)';
    if (!form.email.trim()) e.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Email invalide';
    if (!form.phone.trim()) e.phone = 'Téléphone requis';
    else if (!PHONE_REGEX.test(form.phone.trim()))
      e.phone = 'Format : 77/78/76/70/75 suivi de 7 chiffres';
    if (!form.password) e.password = 'Mot de passe requis';
    else if (form.password.length < 6) e.password = 'Min. 6 caractères';
    if (form.confirmPassword !== form.password)
      e.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: RegisterParentRequest = {
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        cin: form.cin?.trim() || undefined,
        address: form.address?.trim() || undefined,
        city: form.city?.trim() || undefined,
        profession: form.profession?.trim() || undefined,
      };
      await authApi.registerParent(payload);
      Alert.alert(
        'Inscription réussie',
        'Votre compte a été créé. Vous pouvez maintenant vous connecter.',
        [{ text: 'Se connecter', onPress: () => nav.replace('Login') }]
      );
    } catch (err: any) {
      const message = err?.message ?? 'Échec de l\'inscription';
      Alert.alert('Inscription impossible', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded scroll>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>SchoolPilot</Text>
          <Text style={styles.title}>Créer un compte parent</Text>
          <Text style={styles.subtitle}>
            Renseignez vos informations pour accéder à l'espace parent.
          </Text>
        </View>

        <Input
          label="Prénom *"
          value={form.firstName}
          onChangeText={(v) => set('firstName', v)}
          error={errors.firstName}
          autoCapitalize="words"
          placeholder="Aminata"
        />
        <Input
          label="Nom *"
          value={form.lastName}
          onChangeText={(v) => set('lastName', v)}
          error={errors.lastName}
          autoCapitalize="words"
          placeholder="Diop"
        />
        <Input
          label="Email *"
          value={form.email}
          onChangeText={(v) => set('email', v)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="parent@exemple.com"
        />
        <Input
          label="Téléphone *"
          value={form.phone}
          onChangeText={(v) => set('phone', v)}
          error={errors.phone}
          keyboardType="phone-pad"
          placeholder="771234567"
          helper="Format : 77/78/76/70/75 suivi de 7 chiffres"
        />
        <Input
          label="Mot de passe *"
          value={form.password}
          onChangeText={(v) => set('password', v)}
          error={errors.password}
          secureTextEntry
          placeholder="Min. 6 caractères"
        />
        <Input
          label="Confirmer le mot de passe *"
          value={form.confirmPassword}
          onChangeText={(v) => set('confirmPassword', v)}
          error={errors.confirmPassword}
          secureTextEntry
        />

        <Text style={styles.sectionTitle}>Informations complémentaires (optionnel)</Text>

        <Input
          label="CIN / Numéro d'identité"
          value={form.cin ?? ''}
          onChangeText={(v) => set('cin', v)}
        />
        <Input
          label="Adresse"
          value={form.address ?? ''}
          onChangeText={(v) => set('address', v)}
        />
        <Input label="Ville" value={form.city ?? ''} onChangeText={(v) => set('city', v)} />
        <Input
          label="Profession"
          value={form.profession ?? ''}
          onChangeText={(v) => set('profession', v)}
        />

        <Button
          label="Créer mon compte"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <Pressable onPress={() => nav.replace('Login')}>
            <Text style={styles.link}>Se connecter</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  brand: { ...typography.h3, color: colors.secondary, marginBottom: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  footerText: { ...typography.body, color: colors.textSecondary },
  link: { ...typography.bodyBold, color: colors.primary },
});
