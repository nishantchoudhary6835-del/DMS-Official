import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  stack: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.xl,
    right: theme.spacing.xl,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderLeftWidth: theme.spine.width * 2,
    ...theme.elevation.hero,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  message: {
    ...theme.typography.bodyBold,
    flexShrink: 1,
  },

  // Same tint-plus-spine language as ErrorBanner and Badge, just louder — a
  // filled colour reads at a glance from the bottom edge.
  success: {
    backgroundColor: theme.colors.successLight,
    borderLeftColor: theme.colors.success,
  },
  successText: {
    color: theme.colors.success,
  },
  error: {
    backgroundColor: theme.colors.dangerLight,
    borderLeftColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.dangerDark,
  },
  info: {
    backgroundColor: theme.colors.infoLight,
    borderLeftColor: theme.colors.info,
  },
  infoText: {
    color: theme.colors.info,
  },
});
