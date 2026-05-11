import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import type { RootStackParamList } from '../../navigation/types';
import { colors, radius, shadows, spacing, typography } from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const { login } = useAuth();
  const nav = useNavigation<Nav>();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!identifier.trim() || !password) {
      setError('Veuillez saisir vos identifiants');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login({ identifier: identifier.trim(), password });
    } catch (e: any) {
      const message = e?.message ?? 'Échec de la connexion';
      setError(message);
      Alert.alert('Connexion impossible', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Hero bleu Innovation Code */}
      <SafeAreaView style={styles.hero} edges={['top']}>
        <View style={styles.heroInner}>
          <View style={styles.logoBox}>
            <Ionicons name="school" size={28} color={colors.primary} />
          </View>
          <Text style={styles.brand}>SchoolPilot</Text>
          <Text style={styles.tagline}>Espace Parent</Text>
        </View>
      </SafeAreaView>

      {/* Carte formulaire flottante */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.bodyWrap}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Connexion</Text>
            <Text style={styles.cardSubtitle}>
              Accédez aux informations de vos enfants.
            </Text>

            <View style={styles.form}>
              <Input
                label="Email ou identifiant"
                leftIcon="mail-outline"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="parent@exemple.com"
                textContentType="username"
              />
              <Input
                label="Mot de passe"
                leftIcon="lock-closed-outline"
                togglePassword
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                textContentType="password"
              />

              <Pressable onPress={() => nav.navigate('ForgotPassword')} style={styles.forgotRow}>
                <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
              </Pressable>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                label="Se connecter"
                fullWidth
                loading={loading}
                onPress={onSubmit}
                size="lg"
                style={{ marginTop: spacing.md }}
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable onPress={() => nav.navigate('Register')} style={styles.registerBtn}>
              <Ionicons name="person-add-outline" size={18} color={colors.secondary} />
              <Text style={styles.registerText}>Créer un compte parent</Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            Besoin d'aide ? Contactez l'administration de l'école.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  // Hero
  hero: {
    backgroundColor: colors.secondary,
    paddingBottom: spacing['2xl'],
  },
  heroInner: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  brand: {
    ...typography.h1,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    textAlign: 'center',
  },

  // Body
  bodyWrap: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  cardTitle: { ...typography.h2, color: colors.text },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  form: {},
  forgotRow: { alignSelf: 'flex-end', marginBottom: spacing.sm, marginTop: -spacing.xs },
  forgotLink: { ...typography.caption, color: colors.secondary, fontWeight: '600' },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    ...typography.small,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
    textTransform: 'uppercase',
  },

  // Register CTA
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    backgroundColor: colors.surface,
  },
  registerText: { ...typography.bodyBold, color: colors.secondary },

  footer: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
