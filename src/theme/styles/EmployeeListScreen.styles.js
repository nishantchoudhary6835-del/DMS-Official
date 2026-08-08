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
    paddingBottom: theme.spacing.sm,
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

  searchBlock: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  searchField: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  searchButton: {
    minHeight: 42,
    height: 42,
  },

  suggestions: {
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    overflow: 'hidden',
    marginTop: theme.spacing.xs,
  },
  suggestion: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  suggestionLast: {
    borderBottomWidth: 0,
  },
  suggestionPressed: {
    backgroundColor: theme.colors.surface,
  },
  suggestionEmail: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
  },
  suggestionMeta: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 1,
  },

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
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  filterChevron: {
    ...theme.typography.small,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  filterSummary: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  filterClear: {
    ...theme.typography.small,
    color: theme.colors.danger,
    fontWeight: '600',
  },

  filterGroups: {
    paddingBottom: theme.spacing.xs,
  },
  filterRow: {
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
    marginBottom: theme.spacing.xs,
  },
  emptyBody: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});
