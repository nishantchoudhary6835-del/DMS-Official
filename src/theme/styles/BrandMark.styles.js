import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  logo_large: { width: 236, height: 111 },
  logo_medium: { width: 172, height: 81 },
  logo_small: { width: 124, height: 59 },

  tagline: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
});
