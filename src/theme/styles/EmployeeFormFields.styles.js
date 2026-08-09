import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  notice: {
    backgroundColor: theme.colors.accentLight,
    borderRadius: theme.radius.md,
    borderLeftWidth: theme.spine.width,
    borderLeftColor: theme.colors.spine.accent,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  noticeTitle: {
    ...theme.typography.label,
    color: theme.colors.accent,
    marginBottom: 2,
  },
  noticeBody: {
    ...theme.typography.small,
    color: theme.colors.accent,
  },
});
