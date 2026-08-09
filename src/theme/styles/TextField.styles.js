import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.overline,
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
  },
  // Crimson focus ring — the one place the brand colour appears on a form.
  inputFocused: {
    borderColor: theme.colors.borderFocus,
    borderWidth: 1.5,
    backgroundColor: theme.colors.card,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  inputDisabled: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.textMuted,
  },
  message: {
    ...theme.typography.small,
    minHeight: 15,
    marginTop: 3,
  },
  errorText: {
    color: theme.colors.danger,
  },
  helperText: {
    color: theme.colors.textSecondary,
  },
});
