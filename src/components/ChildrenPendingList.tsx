import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import {
  Badge,
  Card,
  EmptyState,
  ErrorView,
  Loader,
  Screen,
  SectionHeader,
} from './ui';
import { useSelectedChild } from '../contexts/SelectedChildContext';
import { colors, radius, spacing, typography } from '../theme';
import type { ChildSummary } from '../types/parent';
import { initials } from '../utils/format';

interface ChildrenPendingListProps {
  /** Titre de la section (ex: "Notes", "Bulletins") */
  title: string;
  /** Phrase qui explique pourquoi le contenu n'est pas encore disponible */
  description: string;
  /** Icône représentative de la section */
  icon: keyof typeof Ionicons.glyphMap;
  /** Couleur d'accent (du thème, ex: colors.primary) */
  accent: string;
}

export function ChildrenPendingList({
  title,
  description,
  icon,
  accent,
}: ChildrenPendingListProps) {
  const { children, isLoading, error, refetch } = useSelectedChild();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return children;
    return children.filter((c) => c.fullName.toLowerCase().includes(q));
  }, [children, search]);

  if (isLoading) {
    return (
      <Screen>
        <Loader label="Chargement…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorView message={error.message} onRetry={refetch} />
      </Screen>
    );
  }

  if (children.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Aucun enfant rattaché"
          description="Les enfants liés à votre compte apparaîtront ici."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.intro}>
        <View style={[styles.iconBox, { backgroundColor: accent + '1A' }]}>
          <Ionicons name={icon} size={22} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.introTitle}>{title}</Text>
          <Text style={styles.introDesc}>{description}</Text>
        </View>
      </Card>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un enfant…"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <SectionHeader
        title={`${filtered.length} enfant${filtered.length > 1 ? 's' : ''}`}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Aucun résultat"
          description={`Aucun enfant ne correspond à « ${search} ».`}
        />
      ) : (
        filtered.map((child) => <ChildRow key={child.id} child={child} />)
      )}
    </Screen>
  );
}

function ChildRow({ child }: { child: ChildSummary }) {
  return (
    <Card style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(child.firstName, child.lastName)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{child.fullName}</Text>
        <Text style={styles.meta}>
          {child.currentClass ?? 'Classe non assignée'}
          {child.academicYear ? ` • ${child.academicYear}` : ''}
        </Text>
      </View>
      <Badge label="En attente" tone="warning" />
    </Card>
  );
}

const styles = StyleSheet.create({
  intro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: { ...typography.bodyBold, color: colors.text },
  introDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.bodyBold, color: '#FFF' },
  name: { ...typography.bodyBold, color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
