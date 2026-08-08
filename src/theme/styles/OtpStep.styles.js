import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  title: theme.patterns.screenTitle,
  subtitle: theme.patterns.screenSubtitle,
  email: theme.patterns.emphasis,
  timer: theme.patterns.mutedCaption,

  error: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    marginTop: theme.spacing.sm,
  },
  timerRow: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  expired: {
    ...theme.typography.caption,
    color: theme.colors.warning,
    textAlign: 'center',
  },
  action: {
    marginBottom: theme.spacing.sm,
  },
});
