import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { theme } from '@theme';

import { styles } from '@theme/styles/ErrorBanner.styles';

export function ErrorBanner({ message, variant = 'error', style }) {
  if (!message) return null;

  const isSuccess = variant === 'success';

  return (
    <View
      style={[styles.container, isSuccess ? styles.success : styles.error, style]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons
        name={isSuccess ? 'checkmark-circle' : 'alert-circle'}
        size={16}
        color={isSuccess ? theme.colors.success : theme.colors.danger}
        style={styles.icon}
      />
      <Text
        style={[styles.text, isSuccess ? styles.successText : styles.errorText]}
      >
        {message}
      </Text>
    </View>
  );
}
