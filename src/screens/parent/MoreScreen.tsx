import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Screen, SectionHeader } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import type { MoreStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';

type Nav = NativeStackNavigationProp<MoreStackParamList, 'MoreHome'>;

export function MoreScreen() {
  const nav = useNavigation<Nav>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Se déconnecter', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Screen>
      <Card style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.firstName?.[0] ?? '?') + (user?.lastName?.[0] ?? '')}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </Card>

      <SectionHeader title="Famille & école" />
      <Card style={styles.list}>
        <MenuItem
          icon="people-outline"
          label="Mes enfants"
          onPress={() => nav.navigate('ChildrenList')}
        />
        <MenuItem
          icon="document-text-outline"
          label="Préinscriptions"
          onPress={() => nav.navigate('PreRegistrationsList')}
        />
        <MenuItem
          icon="calendar-outline"
          label="Calendrier"
          onPress={() => nav.navigate('CalendarHome')}
        />
        <MenuItem
          icon="mail-outline"
          label="Invitations"
          onPress={() => nav.navigate('Invitations')}
          last
        />
      </Card>

      <SectionHeader title="Compte" />
      <Card style={styles.list}>
        <MenuItem
          icon="person-outline"
          label="Mon profil"
          onPress={() => nav.navigate('Profile')}
        />
        <MenuItem
          icon="lock-closed-outline"
          label="Changer le mot de passe"
          onPress={() => nav.navigate('ChangePassword')}
          last
        />
      </Card>

      <SectionHeader title="Session" />
      <Card style={styles.list}>
        <MenuItem
          icon="log-out-outline"
          label="Se déconnecter"
          onPress={handleLogout}
          danger
          last
        />
      </Card>

      <Text style={styles.version}>SchoolPilot Mobile • v1.0.0</Text>
    </Screen>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  last,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  last?: boolean;
  danger?: boolean;
}) {
  const color = danger ? colors.danger : colors.text;
  const iconColor = danger ? colors.danger : colors.secondary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        !last && styles.itemBorder,
        pressed && { backgroundColor: colors.surfaceAlt },
      ]}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
      <Text style={[styles.itemLabel, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h3, color: colors.secondary },
  name: { ...typography.bodyBold, color: colors.text },
  email: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  list: { padding: 0, marginBottom: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  itemLabel: { ...typography.body, flex: 1 },
  version: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
