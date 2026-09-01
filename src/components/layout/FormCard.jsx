import { View } from 'react-native';

import { styles } from '@theme/styles/FormCard.styles';

// Caps and centers a form's content so it reads as a bounded card on wide
// (desktop/web) viewports instead of stretching edge to edge.
export function FormCard({ children, maxWidth = 680, style }) {
  return <View style={[styles.wrap, { maxWidth }, style]}>{children}</View>;
}
