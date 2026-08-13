import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  field: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  fieldError: {
    borderColor: theme.colors.danger,
  },
  fieldDisabled: {
    backgroundColor: theme.colors.surface,
  },

  textWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: theme.spacing.sm,
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  placeholder: {
    color: theme.colors.textMuted,
  },
  size: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  action: {
    ...theme.typography.label,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
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
