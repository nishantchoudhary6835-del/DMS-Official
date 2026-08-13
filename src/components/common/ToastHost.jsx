import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';

import { theme } from '@theme';

import { styles } from '@theme/styles/ToastHost.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const ICON_BY_TYPE = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

const ICON_COLOR_BY_TYPE = {
  success: theme.colors.success,
  error: theme.colors.dangerDark,
  info: theme.colors.info,
};

const TEXT_STYLE_BY_TYPE = {
  success: styles.successText,
  error: styles.errorText,
  info: styles.infoText,
};

function ToastItem({ type, message, onDismiss }) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      speed: 18,
      bounciness: 4,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [enter]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          {
            translateY: enter.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
      }}
    >
      <Pressable
        style={[styles.toast, styles[type]]}
        onPress={onDismiss}
        accessibilityRole="alert"
      >
        <Ionicons
          name={ICON_BY_TYPE[type] ?? ICON_BY_TYPE.info}
          size={20}
          color={ICON_COLOR_BY_TYPE[type] ?? ICON_COLOR_BY_TYPE.info}
          style={styles.icon}
        />
        <Text
          style={[styles.message, TEXT_STYLE_BY_TYPE[type] ?? styles.infoText]}
          numberOfLines={3}
        >
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function ToastHost({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <View style={styles.stack} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </View>
  );
}
