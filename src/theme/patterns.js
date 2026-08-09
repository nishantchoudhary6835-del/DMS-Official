import { colors } from './colors';
import { spacing, radius, spine } from './spacing';
import { typography } from './typography';

export const patterns = {
  screenTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  screenSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },

  emphasis: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  mutedCaption: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  /** Uppercase divider above a group of rows. */
  sectionLabel: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },

  /** The Bureau card: 1px border, 5px radius, barely-there lift. */
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
  },

  /** Same card, carrying a crimson spine down its left edge. */
  cardSpined: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    borderLeftWidth: spine.width,
    borderLeftColor: colors.spine.primary,
  },

  /** Employee IDs, reference codes — anything that is a code, not a word. */
  code: {
    ...typography.mono,
    color: colors.textMuted,
  },
};
