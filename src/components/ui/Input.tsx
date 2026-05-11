import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, ReactNode, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  /** Icône à gauche de l'input (nom Ionicons) */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Élément personnalisé à droite (ex: bouton afficher/masquer) */
  rightSlot?: ReactNode;
  /** Affiche un toggle œil pour les mots de passe (utilisable avec secureTextEntry) */
  togglePassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helper,
      containerStyle,
      style,
      leftIcon,
      rightSlot,
      togglePassword,
      secureTextEntry,
      ...rest
    },
    ref
  ) => {
    const [hidden, setHidden] = useState(true);
    const isSecure = togglePassword ? hidden : secureTextEntry;

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={[styles.field, error ? styles.fieldError : null]}>
          {leftIcon ? (
            <Ionicons
              name={leftIcon}
              size={18}
              color={colors.textMuted}
              style={styles.leftIcon}
            />
          ) : null}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={isSecure}
            style={[styles.input, leftIcon ? styles.inputWithIcon : null, style]}
            {...rest}
          />
          {togglePassword ? (
            <Pressable
              onPress={() => setHidden((v) => !v)}
              hitSlop={8}
              style={styles.rightSlot}
            >
              <Ionicons
                name={hidden ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          ) : rightSlot ? (
            <View style={styles.rightSlot}>{rightSlot}</View>
          ) : null}
        </View>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : helper ? (
          <Text style={styles.helper}>{helper}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  fieldError: { borderColor: colors.danger },
  leftIcon: { marginLeft: spacing.md },
  rightSlot: { paddingHorizontal: spacing.md },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  inputWithIcon: { paddingLeft: spacing.sm },
  error: { ...typography.small, color: colors.danger, marginTop: spacing.xs },
  helper: { ...typography.small, color: colors.textSecondary, marginTop: spacing.xs },
});
