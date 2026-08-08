import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  marker: {
    width: 18,
    ...theme.typography.caption,
  },
  markerOn: {
    color: theme.colors.success,
  },
  markerOff: {
    color: theme.colors.textMuted,
  },
  label: {
    ...theme.typography.caption,
    marginLeft: theme.spacing.xs,
  },
  labelOn: {
    color: theme.colors.success,
  },
  labelOff: {
    color: theme.colors.textSecondary,
  },
});
