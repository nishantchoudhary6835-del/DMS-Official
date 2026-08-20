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
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  count: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },

  // react-native-web gives ScrollView `flexGrow: 1`; when the list below
  // collapses this row grows and stretches every chip. Pinning it stops that.
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterRow: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },

  filterFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // flex-start, not stretch: a validation message wrapping under one date
    // field must not drag the other two out of line.
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  // Wraps to one field per row on narrow screens rather than crushing three
  // side by side; 180 is about where a YYYY-MM-DD placeholder stops fitting.
  filterField: {
    flexGrow: 1,
    flexBasis: 180,
    minWidth: 180,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },

  errorBlock: {
    paddingHorizontal: theme.spacing.lg,
  },

  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
    flexGrow: 1,
  },

  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },

  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  pagerLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
});
