import { Text, View } from 'react-native';

import { styles } from '@theme/styles/Badge.styles';

export function Badge({ label, tone = 'neutral', style }) {
  return (
    <View style={[styles.badge, styles[tone], style]}>
      <Text style={[styles.label, styles[`${tone}Label`]]}>{label}</Text>
    </View>
  );
}
