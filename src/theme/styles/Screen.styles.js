import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  // Transparent by default so the app-root painted canvas shows through.
  safe: {
    flex: 1,
    backgroundColor: theme.colors.transparent,
  },
  safePlain: {
    backgroundColor: theme.colors.canvas,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
  },
  contentFixed: {
    flex: 1,
    width: '100%',
  },
  padded: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
});
