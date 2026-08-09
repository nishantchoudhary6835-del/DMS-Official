import { useEffect, useRef } from 'react';
import { Animated, Modal, Platform, Pressable, Text } from 'react-native';

import { Button } from '@components/common/Button';

import { styles } from '@theme/styles/ConfirmDialog.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isBusy = false,
}) {
  // The Modal already cross-fades; this lifts the sheet the last few pixels
  // so a destructive prompt arrives rather than simply appearing.
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      enter.setValue(0);
      return;
    }

    Animated.spring(enter, {
      toValue: 1,
      speed: 18,
      bounciness: 4,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [visible, enter]);

  const sheetStyle = {
    opacity: enter,
    transform: [
      { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isBusy ? undefined : onCancel}
    >
      <Pressable
        style={styles.backdrop}
        onPress={isBusy ? undefined : onCancel}
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
      >
        <Animated.View style={[styles.sheetWrap, sheetStyle]}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}

            <Button
              title={confirmLabel}
              onPress={onConfirm}
              loading={isBusy}
              variant={confirmVariant}
              style={styles.confirm}
            />
            <Button
              title={cancelLabel}
              onPress={onCancel}
              variant="text"
              disabled={isBusy}
            />
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
