import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { authApi } from '../../api/authApi';
import { Button, Card, Input, Screen } from '../../components/ui';
import { colors, spacing, typography } from '../../theme';

export function ChangePasswordScreen() {
  const nav = useNavigation();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!current) e.current = 'Mot de passe actuel requis';
    if (!next) e.next = 'Nouveau mot de passe requis';
    else if (next.length < 6) e.next = 'Min. 6 caractères';
    if (confirm !== next) e.confirm = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: current,
        newPassword: next,
        confirmPassword: confirm,
      });
      Alert.alert('Succès', 'Mot de passe modifié avec succès', [
        { text: 'OK', onPress: () => nav.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message ?? 'Échec du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

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

      <Text style={styles.intro}>
        Choisissez un mot de passe robuste que vous n'utilisez pas ailleurs.
      </Text>

      <Card style={styles.card}>
        <Input
          label="Mot de passe actuel *"
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          error={errors.current}
          textContentType="password"
        />
        <Input
          label="Nouveau mot de passe *"
          value={next}
          onChangeText={setNext}
          secureTextEntry
          error={errors.next}
          helper="Minimum 6 caractères"
          textContentType="newPassword"
        />
        <Input
          label="Confirmer le nouveau mot de passe *"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          error={errors.confirm}
          textContentType="newPassword"
        />

        <Button
          label="Mettre à jour le mot de passe"
          loading={loading}
          onPress={handleSubmit}
          fullWidth
        />
      </Card>
    </Screen>
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
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: { marginBottom: spacing.md },
});
