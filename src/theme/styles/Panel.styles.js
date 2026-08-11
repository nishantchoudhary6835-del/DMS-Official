import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    ...theme.elevation.card,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    flexShrink: 1,
  },

  body: {
    flex: 1,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  footerHovered: {
    opacity: 0.7,
  },
  footerLabel: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  footerIcon: {
    marginLeft: 5,
  },
});
