import { Image, Text, View } from 'react-native';

import { styles } from '@theme/styles/BrandMark.styles';

const logoSource = require('@assets/images/logo.png');

export function BrandMark({ size = 'large', showTagline = false, style }) {
  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="image"
      accessibilityLabel="Syandrix Infotech"
    >
      <Image
        source={logoSource}
        resizeMode="contain"
        style={styles[`logo_${size}`]}
      />

      {showTagline ? (
        <Text style={styles.tagline}>Document Management System</Text>
      ) : null}
    </View>
  );
}
