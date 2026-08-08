import { Text, View } from 'react-native';

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
      <Text
        style={[styles.text, isSuccess ? styles.successText : styles.errorText]}
      >
        {message}
      </Text>
    </View>
  );
}
