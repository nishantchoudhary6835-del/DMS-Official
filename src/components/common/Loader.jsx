import { ActivityIndicator, Text, View } from 'react-native';

import { theme } from '@theme';

import { styles } from '@theme/styles/Loader.styles';

export function Loader({ message, fullScreen = true }) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}
