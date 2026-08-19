import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Platform, Pressable, Text, View } from 'react-native';

import { theme } from '@theme';

import { styles } from '@theme/styles/AccountMenu.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function MenuRow({ icon, label, tone = 'default', onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ hovered, pressed }) => [
        styles.row,
        (hovered || pressed) && styles.rowHovered,
      ]}
    >
      <Ionicons
        name={icon}
        size={17}
        color={tone === 'danger' ? theme.colors.danger : theme.colors.textSecondary}
      />
      <Text style={[styles.rowLabel, tone === 'danger' && styles.rowLabelDanger]}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Anchored under the name/avatar in TopBar (top-right, every screen), rather
 * than a centred confirm-style dialog — this is a dropdown menu, not a
 * decision prompt. Positioned with fixed offsets matching TopBar's own
 * height/padding instead of measuring the trigger, since the trigger is
 * always in the same place (top bar, right-aligned).
 */
export function AccountMenu({
  visible,
  name,
  email,
  onChangePassword,
  onSignOut,
  onDismiss,
}) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      enter.setValue(0);
      return;
    }

    Animated.timing(enter, {
      toValue: 1,
      duration: 120,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [visible, enter]);

  const sheetStyle = {
    opacity: enter,
    transform: [
      { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [-6, 0],
        }),
      },
    ],
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Close menu"
      >
        <Animated.View style={[styles.sheetWrap, sheetStyle]}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.identity}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              {email ? (
                <Text style={styles.email} numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
            </View>

            <View style={styles.divider} />

            <MenuRow
              icon="lock-closed-outline"
              label="Change password"
              onPress={onChangePassword}
            />
            <MenuRow
              icon="log-out-outline"
              label="Sign out"
              tone="danger"
              onPress={onSignOut}
            />
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
