import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@theme';
import { toneOf } from '@theme/tones';

import { styles } from '@theme/styles/StatCard.styles';

export function StatCard({ icon, tone = 'neutral', value, label, linkLabel, onPress, style }) {
  const { ink, tint } = toneOf(tone);

  return (
    <View style={[styles.card, { borderLeftColor: ink }, style]}>
      <View style={styles.top}>
        <View style={[styles.glyph, { backgroundColor: tint }]}>
          <Ionicons name={icon} size={19} color={ink} />
        </View>

        <View style={styles.figures}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label} numberOfLines={2}>
            {label}
          </Text>
        </View>
      </View>

      {linkLabel ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          style={({ hovered }) => [styles.link, hovered && styles.linkHovered]}
        >
          <Text style={styles.linkLabel}>{linkLabel}</Text>
          <Ionicons
            name="arrow-forward"
            size={12}
            color={theme.colors.primary}
            style={styles.linkIcon}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
