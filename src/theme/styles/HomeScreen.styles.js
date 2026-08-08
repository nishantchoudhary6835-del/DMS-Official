import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  brand: {
    marginBottom: theme.spacing.lg,
  },

  identity: {
    marginBottom: theme.spacing.xl,
  },
  identityLabel: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  identityValue: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },

  sectionLabel: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },

  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  tile: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tileValue: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  tileValueAccent: {
    color: theme.colors.warning,
  },
  tileValueMuted: {
    color: theme.colors.textMuted,
  },
  tileLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  unavailable: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginBottom: theme.spacing.lg,
  },

  action: {
    marginBottom: theme.spacing.md,
  },

  errorBlock: {
    marginBottom: theme.spacing.lg,
  },
});
