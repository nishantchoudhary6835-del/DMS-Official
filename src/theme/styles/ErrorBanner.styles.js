import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },
  error: {
    backgroundColor: theme.colors.dangerLight,
    borderColor: theme.colors.danger,
  },
  success: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  text: {
    ...theme.typography.caption,
  },
  errorText: {
    color: theme.colors.danger,
  },
  successText: {
    color: theme.colors.success,
  },
});
