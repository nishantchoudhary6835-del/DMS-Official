import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  label: {
    ...theme.typography.small,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  neutral: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  neutralLabel: {
    color: theme.colors.textSecondary,
  },

  success: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  successLabel: {
    color: theme.colors.success,
  },

  accent: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  accentLabel: {
    color: '#8A5A08',
  },

  danger: {
    backgroundColor: theme.colors.dangerLight,
    borderColor: theme.colors.danger,
  },
  dangerLabel: {
    color: theme.colors.danger,
  },
});
