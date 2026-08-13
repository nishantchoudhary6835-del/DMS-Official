import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  notice: {
    backgroundColor: theme.colors.surfaceSunk,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  noticeTitle: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: 3,
  },
  noticeBody: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
});
