import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  // Transparent so the painted backdrop shows through rather than being
  // covered by a flat white panel.
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.transparent,
  },
  message: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});
