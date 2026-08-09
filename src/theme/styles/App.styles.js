import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  // The painted canvas sits on this and everything else sits on the canvas.
  root: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  booting: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.canvas,
  },
});
