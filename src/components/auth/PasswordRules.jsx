import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { theme } from '@theme';
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
            <Ionicons
              name={satisfied ? 'checkmark-circle' : 'ellipse-outline'}
              size={15}
              color={satisfied ? theme.colors.success : theme.colors.textMuted}
              style={styles.marker}
            />

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
