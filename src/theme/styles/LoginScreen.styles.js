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

  brand: {
    marginBottom: theme.spacing.xl,
  },

  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.hero,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    // Clips the gradient to the card's top corners.
    overflow: 'hidden',
    ...theme.elevation.raised,
  },

  // --- Signal header -----------------------------------------------------
  cardHeader: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  eyebrow: {
    ...theme.typography.overline,
    color: theme.colors.gradient.onGradientMuted,
    marginBottom: 5,
  },
  title: {
    ...theme.typography.displaySm,
    color: theme.colors.gradient.onGradient,
  },

  // --- Bureau body -------------------------------------------------------
  cardBody: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },

  action: {
    marginTop: theme.spacing.lg,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
