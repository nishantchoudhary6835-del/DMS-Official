import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

import { theme } from '@theme';

// The app's canvas: the brand gradient dimmed to a wash, painted once at the
// root. Screens are transparent and slide over it, so it stays put.
export const ScreenBackground = memo(function ScreenBackground() {
  return (
    <LinearGradient
      colors={theme.colors.gradient.wash}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
});
