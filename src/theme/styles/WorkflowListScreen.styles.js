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
    marginBottom: theme.spacing.md,
  },

  // --- Document filters ----------------------------------------------------
  // Only PublishedDocumentsScreen renders these; the other screens sharing
  // this file simply never reference them.
  searchRow: {
    paddingHorizontal: theme.spacing.lg,
  },

  // react-native-web gives ScrollView a base `flexGrow: 1`. Filter to an
  // empty result and the list below collapses, freeing height this row grows
  // into — stretching every chip into a full-height bar. Pinning flexGrow
  // stops it, same as UserListScreen.
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

  // The status chips and the three Selects together ran to most of a screen
  // on a narrow window, pushing the documents themselves below the fold on
  // the very screens whose job is to list them. They now sit behind this bar,
  // which is one line whether or not anything is filtered — the same
  // disclosure EmployeeListScreen and UserListScreen use.
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.sm,
  },
  filterToggleLabel: {
    ...theme.typography.overline,
    color: theme.colors.textSecondary,
  },
  filterChevron: {
    marginLeft: theme.spacing.xs,
  },
  filterSummary: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  filterClear: {
    ...theme.typography.overline,
    color: theme.colors.danger,
  },
  filterGroups: {
    paddingBottom: theme.spacing.xs,
  },

  filterFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // flex-start, not the default stretch: a validation message wrapping
    // under one select must not drag its neighbours out of line.
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  filterField: {
    flexGrow: 1,
    flexBasis: 180,
    minWidth: 180,
  },

  errorBlock: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },

  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  sectionHeaderText: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionHeaderCount: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  sectionEmpty: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    paddingVertical: theme.spacing.sm,
  },

  centred: {
    alignItems: 'center',
    justifyContent: 'center',
    // Separates the empty-state heading from the Clear filters button the
    // filtered-to-nothing case renders beneath it.
    gap: theme.spacing.sm,
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
  },
});
