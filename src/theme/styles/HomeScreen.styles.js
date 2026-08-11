import { StyleSheet } from 'react-native';

import { theme } from '@theme';

const GAP = theme.spacing.lg;

export const styles = StyleSheet.create({
  greeting: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  greetingCopy: {
    flexShrink: 1,
    minWidth: 220,
    marginRight: theme.spacing.md,
  },
  greetingTitle: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  greetingSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  period: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    marginTop: theme.spacing.sm,
  },
  periodHovered: {
    backgroundColor: theme.colors.surfaceSunk,
  },
  periodLabel: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    marginHorizontal: theme.spacing.sm,
  },

  // The negative margins cancel the trailing gutter on the last cell of each
  // wrapped line, so the grid's right edge lines up with everything above it.
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginRight: -GAP,
    marginBottom: theme.spacing.xl - GAP,
  },
  cell: {
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: GAP,
    paddingBottom: GAP,
    minWidth: 0,
  },
});
