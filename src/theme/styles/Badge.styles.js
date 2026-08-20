import { StyleSheet } from 'react-native';

import { theme } from '@theme';

// Bureau badges carry meaning by tint alone — no border, squared corners. The
// uppercase tracking is what makes them read as status, not as a typed word.
export const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  label: {
    ...theme.typography.overline,
  },

  neutral: {
    backgroundColor: theme.colors.surfaceSunk,
  },
  neutralLabel: {
    color: theme.colors.textSecondary,
  },

  success: {
    backgroundColor: theme.colors.successLight,
  },
  successLabel: {
    color: theme.colors.success,
  },

  accent: {
    backgroundColor: theme.colors.accentLight,
  },
  accentLabel: {
    color: theme.colors.accent,
  },

  danger: {
    backgroundColor: theme.colors.dangerLight,
  },
  dangerLabel: {
    color: theme.colors.danger,
  },

  info: {
    backgroundColor: theme.colors.infoLight,
  },
  infoLabel: {
    color: theme.colors.info,
  },
});
