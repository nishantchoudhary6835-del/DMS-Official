import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@theme';

import { styles } from '@theme/styles/Panel.styles';

// The card chrome every dashboard block shares. Bodies are passed in, so the
// panels differ only in content and never in their edges.
export function Panel({ title, action, footerLabel, onFooterPress, children, style }) {
  return (
    <View style={[styles.panel, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {action}
      </View>

      <View style={styles.body}>{children}</View>

      {footerLabel ? (
        <Pressable
          onPress={onFooterPress}
          accessibilityRole="button"
          style={({ hovered }) => [styles.footer, hovered && styles.footerHovered]}
        >
          <Text style={styles.footerLabel}>{footerLabel}</Text>
          <Ionicons
            name="arrow-forward"
            size={13}
            color={theme.colors.primary}
            style={styles.footerIcon}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
