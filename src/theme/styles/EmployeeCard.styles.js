import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  pressed: {
    opacity: 0.75,
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
    marginTop: 2,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  employeeId: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
    letterSpacing: 0.5,
  },

  placement: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  placementEmpty: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.sm,
  },
  dotOn: {
    backgroundColor: theme.colors.success,
  },
  dotOff: {
    backgroundColor: theme.colors.textMuted,
  },
  registration: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
});
