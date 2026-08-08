import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const patterns = {
  screenTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
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
};
