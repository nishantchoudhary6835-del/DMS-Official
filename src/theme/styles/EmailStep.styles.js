import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  title: theme.patterns.screenTitle,
  subtitle: theme.patterns.screenSubtitle,
  action: {
    marginTop: theme.spacing.md,
  },
});
