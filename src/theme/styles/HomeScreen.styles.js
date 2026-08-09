import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  brand: {
    marginBottom: theme.spacing.lg,
  },

  // --- Signal hero -------------------------------------------------------
  hero: {
    marginBottom: theme.spacing.xl,
  },
  heroLabel: {
    ...theme.typography.overline,
    color: theme.colors.gradient.onGradientMuted,
  },
  heroValue: {
    ...theme.typography.display,
    color: theme.colors.gradient.onGradient,
    marginTop: theme.spacing.xs,
  },
  heroRule: {
    height: 1,
    backgroundColor: theme.colors.gradient.hairline,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  heroMeta: {
    ...theme.typography.small,
    color: theme.colors.gradient.onGradientMuted,
    marginRight: 6,
  },
  heroEmail: {
    ...theme.typography.label,
    color: theme.colors.gradient.onGradient,
    flexShrink: 1,
  },

  // --- Bureau tiles ------------------------------------------------------
  sectionLabel: {
    ...theme.typography.overline,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },

  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Cancels the trailing marginRight on the last tile in each row.
    marginRight: -theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderLeftWidth: theme.spine.width,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    ...theme.elevation.card,
  },
  spine_primary: { borderLeftColor: theme.colors.spine.primary },
  spine_accent: { borderLeftColor: theme.colors.spine.accent },
  spine_success: { borderLeftColor: theme.colors.spine.success },
  spine_info: { borderLeftColor: theme.colors.spine.info },
  spine_neutral: { borderLeftColor: theme.colors.spine.neutral },

  tileValue: {
    ...theme.typography.displaySm,
    color: theme.colors.textPrimary,
  },
  tileLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  unavailable: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },

  action: {
    marginBottom: theme.spacing.sm,
  },

  errorBlock: {
    marginBottom: theme.spacing.lg,
  },
});
