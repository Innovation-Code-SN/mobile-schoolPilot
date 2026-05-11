import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChildSwitcher } from '../../../components/ChildSwitcher';
import {
  Card,
  EmptyState,
  Loader,
  Screen,
  SectionHeader,
} from '../../../components/ui';
import { useSelectedChild } from '../../../contexts/SelectedChildContext';
import type { ScolariteStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';

type Nav = NativeStackNavigationProp<ScolariteStackParamList, 'ScolariteHome'>;

interface MenuItem {
  key: keyof Pick<
    ScolariteStackParamList,
    'Notes' | 'Bulletins' | 'Devoirs' | 'Absences' | 'EmploiDuTemps'
  >;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  color: string;
}

const ITEMS: MenuItem[] = [
  {
    key: 'Notes',
    icon: 'star-outline',
    label: 'Notes',
    description: 'Évaluations & moyennes par matière',
    color: colors.primary,
  },
  {
    key: 'Bulletins',
    icon: 'document-text-outline',
    label: 'Bulletins',
    description: 'Bulletins trimestriels en PDF',
    color: colors.info,
  },
  {
    key: 'Devoirs',
    icon: 'list-outline',
    label: 'Devoirs',
    description: 'Cahier de textes & travail à faire',
    color: colors.success,
  },
  {
    key: 'Absences',
    icon: 'calendar-clear-outline',
    label: 'Présences',
    description: 'Absences, retards & assiduité',
    color: colors.warning,
  },
  {
    key: 'EmploiDuTemps',
    icon: 'time-outline',
    label: 'Emploi du temps',
    description: 'Cours de la semaine',
    color: colors.accent,
  },
];

export function ScolariteHomeScreen() {
  const nav = useNavigation<Nav>();
  const { children, selectedChild, isLoading } = useSelectedChild();

  if (isLoading) {
    return (
      <Screen>
        <Loader label="Chargement…" />
      </Screen>
    );
  }

  if (children.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Aucun enfant"
          description="Aucun enfant n'est rattaché à votre compte. Effectuez une préinscription depuis l'onglet Plus."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ChildSwitcher />

      <View style={{ height: spacing.lg }} />

      <SectionHeader title="Suivi pédagogique" subtitle={selectedChild?.fullName} />

      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.key}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            onPress={() => nav.navigate(item.key)}
          >
            <View style={[styles.tileIcon, { backgroundColor: item.color + '1A' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.tileLabel}>{item.label}</Text>
            <Text style={styles.tileDesc} numberOfLines={2}>
              {item.description}
            </Text>
          </Pressable>
        ))}
      </View>

      <Card style={styles.tipCard}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={styles.tipText}>
          Les données pédagogiques sont en cours d'intégration. Certaines sections peuvent ne pas
          encore afficher de contenu si l'établissement n'a rien publié.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  tileLabel: { ...typography.bodyBold, color: colors.text },
  tileDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
  },
  tipText: { ...typography.caption, color: colors.text, flex: 1, lineHeight: 18 },
});
