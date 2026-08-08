import { Text, View } from 'react-native';

import { PASSWORD_RULES } from '@validation/auth';

import { styles } from '@theme/styles/PasswordRules.styles';

export function PasswordRules({ password = '', visible = true }) {
  if (!visible) return null;

  return (
    <View
      style={styles.container}
      accessibilityRole="summary"
      accessibilityLabel="Password requirements"
    >
      {PASSWORD_RULES.map((rule) => {
        const satisfied = rule.test(password);

        return (
          <View key={rule.id} style={styles.row}>
            <Text
              style={[styles.marker, satisfied ? styles.markerOn : styles.markerOff]}
            >
              {satisfied ? '✓' : '○'}
            </Text>

            <Text
              style={[styles.label, satisfied ? styles.labelOn : styles.labelOff]}
            >
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
