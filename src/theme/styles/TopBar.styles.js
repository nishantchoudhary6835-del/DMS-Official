import { Platform, StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    minHeight: 56,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },

  search: {
    flex: 1,
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSunk,
    paddingHorizontal: theme.spacing.sm,
    marginHorizontal: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    // Web focus rings are drawn by the browser and clash with Bureau's own.
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  shortcut: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  shortcutLabel: {
    ...theme.typography.monoSmall,
    color: theme.colors.textMuted,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  iconAction: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.xs,
  },
  hovered: {
    backgroundColor: theme.colors.surfaceSunk,
  },
  count: {
    position: 'absolute',
    top: 2,
    right: 1,
    minWidth: 15,
    height: 15,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: theme.colors.card,
  },
  countLabel: {
    ...theme.typography.monoSmall,
    fontSize: 9,
    lineHeight: 12,
    color: theme.colors.textOnPrimary,
  },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing.xs,
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    marginLeft: theme.spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    ...theme.typography.label,
    color: theme.colors.textOnPrimary,
  },
  identity: {
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    maxWidth: 160,
  },
  name: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  role: {
    ...theme.typography.overline,
    fontSize: 9,
    color: theme.colors.textMuted,
  },
});
