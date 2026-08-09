import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@theme';

import { styles } from '@theme/styles/GradientCard.styles';

/**
 * The Signal treatment. Deliberately scoped to Login and the Dashboard —
 * every other screen stays flat Bureau, because a gradient behind a
 * two-hundred-row employee list is exhausting rather than expressive.
 */
export function GradientCard({ children, style }) {
  return (
    <LinearGradient
      colors={theme.colors.gradient.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
}
