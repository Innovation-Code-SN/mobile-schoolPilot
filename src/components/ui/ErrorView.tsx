import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button } from './Button';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({
  title = 'Une erreur est survenue',
  message,
  onRetry,
}: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry ? (
        <Button label="Réessayer" variant="secondary" onPress={onRetry} style={styles.retry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.xl },
  title: { ...typography.h3, color: colors.danger, textAlign: 'center' },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retry: { marginTop: spacing.lg },
});
