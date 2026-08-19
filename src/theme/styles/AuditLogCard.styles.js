import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  wrap: {
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.elevation.card,
  },
  pressed: {
    backgroundColor: theme.colors.surface,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  module: {
    ...theme.typography.overline,
    color: theme.colors.textMuted,
  },
  // Pushed hard right so timestamps form a readable column down the list.
  time: {
    ...theme.typography.monoSmall,
    color: theme.colors.textMuted,
    marginLeft: 'auto',
  },

  description: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  actor: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    flexShrink: 1,
  },
  target: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  details: {
    ...theme.typography.small,
    color: theme.colors.primary,
    marginLeft: 'auto',
  },
});
