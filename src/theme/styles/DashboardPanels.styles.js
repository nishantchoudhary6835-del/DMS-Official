import { StyleSheet } from 'react-native';

import { theme } from '@theme';

// Panel bodies only — the chrome lives in Panel.styles.js. They share a file
// because they are variations on one pattern rather than separate components.
export const styles = StyleSheet.create({
  // --- Document status ---------------------------------------------------
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  legend: {
    flex: 1,
    minWidth: 180,
    paddingLeft: theme.spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.sm,
  },
  legendLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  legendValue: {
    ...theme.typography.monoSmall,
    color: theme.colors.textMuted,
  },

  // --- Quick actions -----------------------------------------------------
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: theme.spacing.sm,
  },
  actionHovered: {
    backgroundColor: theme.colors.surfaceSunk,
  },
  actionGlyph: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  actionLabel: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },

  // --- Ideas pipeline ----------------------------------------------------
  idea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  ideaCopy: {
    flex: 1,
    minWidth: 150,
    marginRight: theme.spacing.sm,
  },
  ideaTitle: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  ideaMeta: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  ideaBadge: {
    marginTop: theme.spacing.xs,
  },
});
