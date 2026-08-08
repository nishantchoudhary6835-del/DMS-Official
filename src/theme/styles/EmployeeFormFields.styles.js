import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  notice: {
    backgroundColor: theme.colors.accentLight,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  noticeTitle: {
    ...theme.typography.label,
    color: '#8A5A08',
    marginBottom: 2,
  },
  noticeBody: {
    ...theme.typography.small,
    color: '#8A5A08',
  },
});
