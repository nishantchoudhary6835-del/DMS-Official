import { StyleSheet } from 'react-native';

import { theme } from '@theme';

/**
 * Bodies for the six dashboard panels. The chrome around them lives in
 * Panel.styles.js — these are only the contents, which is why they share a
 * file: they are variations on one pattern rather than six components.
 */
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

  // --- Recent documents table --------------------------------------------
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  tableHead: {
    paddingTop: 0,
    paddingBottom: theme.spacing.sm,
  },
  headCell: {
    ...theme.typography.overline,
    color: theme.colors.textMuted,
  },
  cell: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  cellTitle: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  cellMeta: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 1,
  },

  colTitle: { flex: 1, minWidth: 0, paddingRight: theme.spacing.sm },
  colType: { width: 68, paddingRight: theme.spacing.xs },
  colStage: { width: 106, paddingRight: theme.spacing.xs },
  colUpdated: { width: 80, paddingRight: theme.spacing.xs },
  // alignItems governs the icon cell, textAlign the header above it — the two
  // have to agree or the column reads as misaligned.
  colAction: { width: 50, alignItems: 'flex-end', textAlign: 'right' },

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

  // --- Activity feed -----------------------------------------------------
  activity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  activityGlyph: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    marginTop: 1,
  },
  activityCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: theme.spacing.sm,
  },
  activityTitle: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  activityDetail: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  activityAt: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
});
