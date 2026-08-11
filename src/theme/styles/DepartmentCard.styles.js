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
    borderLeftWidth: theme.spine.width,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.elevation.card,
  },
  spineActive: {
    borderLeftColor: theme.colors.spine.success,
  },
  spineInactive: {
    borderLeftColor: theme.colors.spine.neutral,
  },
  pressed: {
    backgroundColor: theme.colors.surface,
  },

  body: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  codeTile: {
    minWidth: 44,
    height: 38,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  codeLabel: {
    ...theme.typography.monoSmall,
    color: theme.colors.primary,
  },

  details: {
    flex: 1,
    minWidth: 0,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  name: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    flexShrink: 1,
    marginRight: theme.spacing.sm,
  },

  head: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  headEmpty: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 3,
  },

  chevron: {
    marginLeft: theme.spacing.sm,
  },
});
