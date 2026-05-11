import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { authApi } from '../../api/authApi';
import { Button, Card, Input, Screen } from '../../components/ui';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen() {
  const nav = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Veuillez saisir votre email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Email invalide');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword(trimmed);
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? 'Échec de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Screen padded>
        <View style={styles.center}>
          <Text style={styles.icon}>✉️</Text>
          <Text style={styles.title}>Vérifiez vos emails</Text>
          <Text style={styles.body}>
            Si un compte existe avec l'adresse <Text style={styles.bold}>{email.trim()}</Text>, vous
            recevrez un email contenant un lien pour réinitialiser votre mot de passe.
          </Text>

          <Card style={styles.tip}>
            <Text style={styles.tipTitle}>Comment ça marche ?</Text>
            <Text style={styles.tipBody}>
              1. Ouvrez l'email reçu{'\n'}
              2. Cliquez sur le lien « Réinitialiser mon mot de passe »{'\n'}
              3. Choisissez un nouveau mot de passe sur la page web qui s'ouvre{'\n'}
              4. Revenez ici et connectez-vous
            </Text>
          </Card>

          <Text style={styles.muted}>
            Pensez à vérifier vos courriers indésirables si vous ne voyez pas l'email.
          </Text>

          <Button
            label="Retour à la connexion"
            onPress={() => nav.replace('Login')}
            fullWidth
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mot de passe oublié</Text>
          <Text style={styles.subtitle}>
            Renseignez l'adresse email associée à votre compte. Nous vous enverrons un lien pour
            définir un nouveau mot de passe.
          </Text>
        </View>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="parent@exemple.com"
          error={error ?? undefined}
        />

        <Button
          label="Envoyer le lien"
          loading={loading}
          onPress={handleSubmit}
          fullWidth
          style={{ marginTop: spacing.md }}
        />

        <Button
          label="Retour à la connexion"
          variant="ghost"
          onPress={() => nav.replace('Login')}
          fullWidth
          style={{ marginTop: spacing.sm }}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xl, marginTop: spacing.xl },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  center: { flex: 1, justifyContent: 'center' },
  icon: { fontSize: 48, textAlign: 'center', marginBottom: spacing.md },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  bold: { fontWeight: '700', color: colors.text },
  tip: { backgroundColor: colors.primaryLight, marginBottom: spacing.md },
  tipTitle: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.sm },
  tipBody: { ...typography.body, color: colors.text, lineHeight: 22 },
  muted: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
