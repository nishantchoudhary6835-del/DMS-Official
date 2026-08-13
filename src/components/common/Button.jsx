import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { ActivityIndicator, Animated, Platform, Pressable, Text, View } from 'react-native';

import { theme } from '@theme';

import { styles } from '@theme/styles/Button.styles';

// Transforms can run on the native thread, but react-native-web has no
// native driver — passing true there logs a warning on every press.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const LABEL_COLOR = {
  primary: theme.colors.textOnPrimary,
  danger: theme.colors.textOnPrimary,
  secondary: theme.colors.textPrimary,
  text: theme.colors.primary,
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'leading',
  pill = false,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}) {
  const isInteractionBlocked = loading || disabled;
  const scale = useRef(new Animated.Value(1)).current;

  const press = (toValue) => {
    Animated.spring(scale, {
      toValue,
      speed: 40,
      bounciness: 0,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  const contentColor = disabled
    ? theme.colors.textMuted
    : (LABEL_COLOR[variant] ?? theme.colors.textPrimary);

  // The transform lives on an Animated.View wrapper rather than on the
  // Pressable itself: Animated cannot walk a function-style prop, so an
  // AnimatedValue placed inside one is passed through unresolved.
  return (
    <Animated.View
      style={[
        styles.wrap,
        fullWidth && styles.fullWidth,
        { transform: [{ scale }] },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => !isInteractionBlocked && press(0.975)}
        onPressOut={() => press(1)}
        disabled={isInteractionBlocked}
        accessibilityRole="button"
        accessibilityState={{ disabled: isInteractionBlocked, busy: loading }}
        style={({ pressed }) => [
          styles.base,
          styles[variant],
          pill && styles.pill,
          pressed && !isInteractionBlocked && styles[`${variant}Pressed`],
          disabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={contentColor} />
        ) : (
          <View style={styles.labelWrap}>
            {icon && iconPosition === 'leading' ? (
              <Ionicons
                name={icon}
                size={17}
                color={contentColor}
                style={styles.icon}
              />
            ) : null}
            <Text
              style={[styles.label, { color: contentColor }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {icon && iconPosition === 'trailing' ? (
              <Ionicons
                name={icon}
                size={17}
                color={contentColor}
                style={styles.iconTrailing}
              />
            ) : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
