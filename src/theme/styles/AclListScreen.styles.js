import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  count: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    flexShrink: 1,
    marginLeft: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },

  // Opens AclFilterModal rather than expanding inline.
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  filterToggleLabel: {
    ...theme.typography.overline,
    color: theme.colors.textSecondary,
  },

  errorBlock: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },

  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  centred: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  emptyBody: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});
