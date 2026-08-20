import { StyleSheet } from 'react-native';

import { theme } from '@theme';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_WIDTH_COLLAPSED = 68;

export const styles = StyleSheet.create({
  // Opaque, so the rail reads as chrome against the painted canvas rather
  // than as another card floating on it.
  rail: {
    width: SIDEBAR_WIDTH,
    backgroundColor: theme.colors.card,
    borderRightWidth: 1,
    borderRightColor: theme.colors.cardBorder,
  },
  railCollapsed: {
    width: SIDEBAR_WIDTH_COLLAPSED,
  },
  railOverlay: {
    flex: 1,
    borderRightWidth: 0,
    ...theme.elevation.raised,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  headerCollapsed: {
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
  },
  mark: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismiss: {
    padding: theme.spacing.xs,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },

  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.overline,
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  // Collapsed, a section is still a grouping — the rule says so without
  // needing room for a word.
  sectionRule: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 9,
    borderRadius: theme.radius.md,
    marginBottom: 1,
  },
  itemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  itemHovered: {
    backgroundColor: theme.colors.surfaceSunk,
  },
  itemPressed: {
    backgroundColor: theme.colors.surfaceSunk,
    opacity: 0.8,
  },
  // Crimson as a fill is reserved for the primary button and, now, the one
  // place in the rail that says where you are.
  itemActive: {
    backgroundColor: theme.colors.primary,
  },
  itemLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
    flexShrink: 1,
  },
  itemLabelActive: {
    color: theme.colors.textOnPrimary,
  },

  collapse: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  collapseLabel: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
});
