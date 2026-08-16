import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },

  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.hero,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    overflow: 'hidden',
    ...theme.elevation.raised,
  },

  // --- Brand band --------------------------------------------------------
  cardBrand: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
  },

  // --- Bureau body -------------------------------------------------------
  cardBody: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },

  action: {
    marginTop: theme.spacing.lg,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.surfaceSunk,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
