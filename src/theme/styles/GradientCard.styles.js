import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.hero,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.elevation.hero,
  },
});
