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
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.elevation.card,
  },
  spineActive: {
    borderLeftColor: theme.colors.spine.success,
  },
  spineInactive: {
    borderLeftColor: theme.colors.spine.neutral,
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
    marginTop: theme.spacing.xs,
  },
  employeeId: {
    ...theme.typography.monoSmall,
    color: theme.colors.textMuted,
  },
  metaDot: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginHorizontal: 5,
  },
  role: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    flexShrink: 1,
  },

  placement: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  placementEmpty: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 3,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceSunk,
  },
  registration: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  chevron: {
    marginLeft: theme.spacing.sm,
  },
});
