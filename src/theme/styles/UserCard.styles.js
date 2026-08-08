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
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },
  badgeGap: {
    marginRight: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },

  footer: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  footerLine: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  footerWarn: {
    ...theme.typography.small,
    color: theme.colors.danger,
    marginTop: 2,
  },
});
