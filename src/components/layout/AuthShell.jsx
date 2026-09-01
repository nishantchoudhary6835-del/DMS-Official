import { View } from 'react-native';

import { styles } from '@theme/styles/AuthShell.styles';

// The Bureau card shell Login already uses (bounded width, bordered, lightly
// raised), lifted out so multi-step auth flows read as the same compact box.
export function AuthShell({ children, brand, footer, maxWidth = 440, style }) {
  return (
    <View style={styles.page}>
      <View style={[styles.card, { maxWidth }, style]}>
        {brand ? <View style={styles.cardBrand}>{brand}</View> : null}
        <View style={styles.cardBody}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </View>
  );
}
