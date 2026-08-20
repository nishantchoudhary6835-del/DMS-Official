import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  // No step counter to sit opposite the Back button any more, so this is a
  // single-item row rather than a space-between pair.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  brand: {
    marginBottom: theme.spacing.xl,
  },
  title: theme.patterns.screenTitle,
  subtitle: theme.patterns.screenSubtitle,
  action: {
    marginTop: theme.spacing.lg,
  },
});
