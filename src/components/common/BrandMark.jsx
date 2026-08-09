import { Image, Text, View } from 'react-native';

import { styles } from '@theme/styles/BrandMark.styles';

const logoSource = require('@assets/images/logo.png');

export function BrandMark({
  size = 'large',
  showTagline = false,
  align = 'center',
  style,
}) {
  const isLeft = align === 'left';

  return (
    <View
      style={[styles.container, isLeft && styles.containerLeft, style]}
      accessibilityRole="image"
      accessibilityLabel="Syandrix Infotech"
    >
      <Image
        source={logoSource}
        resizeMode="contain"
        style={styles[`logo_${size}`]}
      />

      {showTagline ? (
        <Text style={[styles.tagline, isLeft && styles.taglineLeft]}>
          Document Management System
        </Text>
      ) : null}
    </View>
  );
}
