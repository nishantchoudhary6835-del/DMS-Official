import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { theme } from '@theme';

import { styles } from '@theme/styles/Button.styles';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}) {
  const isInteractionBlocked = loading || disabled;
  const isSolid = variant !== 'secondary' && variant !== 'text';

  return (
    <Pressable
      onPress={onPress}
      disabled={isInteractionBlocked}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInteractionBlocked, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isInteractionBlocked && styles[`${variant}Pressed`],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            isSolid ? theme.colors.textOnPrimary : theme.colors.primary
          }
        />
      ) : (
        <View style={styles.labelWrap}>
          <Text style={[styles.label, styles[`${variant}Label`]]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
