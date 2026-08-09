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
    borderLeftColor: theme.colors.spine.neutral,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.elevation.card,
  },
  pressed: {
    backgroundColor: theme.colors.surface,
  },

  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarLocked: {
    backgroundColor: theme.colors.dangerLight,
  },
  avatarLabel: {
    ...theme.typography.label,
    fontSize: 12.5,
    color: theme.colors.primary,
  },

  details: {
    flex: 1,
    minWidth: 0,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    flexShrink: 1,
    marginRight: theme.spacing.sm,
  },
  email: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },
  badgeGap: {
    marginRight: 5,
    marginTop: 5,
  },

  footer: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceSunk,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  code: {
    ...theme.typography.monoSmall,
    color: theme.colors.textMuted,
  },
  footerDot: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginHorizontal: 5,
  },
  footerLine: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    flexShrink: 1,
  },
  footerWarn: {
    ...theme.typography.small,
    color: theme.colors.danger,
    marginTop: 3,
  },
});
