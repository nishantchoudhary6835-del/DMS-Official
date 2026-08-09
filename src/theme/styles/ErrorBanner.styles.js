import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  // Spine on the left rather than a full outline — same language the
  // cards and tiles use, so severity always reads from the same edge.
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderLeftWidth: theme.spine.width,
    marginBottom: theme.spacing.lg,
  },
  error: {
    backgroundColor: theme.colors.dangerLight,
    borderLeftColor: theme.colors.danger,
  },
  success: {
    backgroundColor: theme.colors.successLight,
    borderLeftColor: theme.colors.success,
  },
  icon: {
    marginRight: 7,
    marginTop: 1,
  },
  text: {
    ...theme.typography.caption,
    flex: 1,
  },
  errorText: {
    color: theme.colors.dangerDark,
  },
  successText: {
    color: theme.colors.success,
  },
});
