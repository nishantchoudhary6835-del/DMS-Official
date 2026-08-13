import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { theme } from '@theme';
import {
  actionExplainer,
  actionIcon,
  permissionSentence,
  PERMISSION_STATUS,
} from '@validation/permission';

import { styles } from '@theme/styles/PermissionCard.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export function PermissionCard({ permission, onPress }) {
  const isActive = permission.status === PERMISSION_STATUS.ACTIVE;

  // The generated explanation always shows — it's the one guaranteed to
  // actually say what the action does. A custom description often just
  // restates the title ("Create teams" under "Create Team"), which answers
  // nothing new, so it's shown as a secondary note rather than replacing
  // the real explanation.
  const explanation = actionExplainer(permission);
  const hasCustomNote =
    permission.description && permission.description.trim() !== explanation;

  const scale = useRef(new Animated.Value(1)).current;

  const press = (toValue) => {
    Animated.spring(scale, {
      toValue,
      speed: 44,
      bounciness: 0,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  // Animated cannot walk a function-style prop, so the transform sits on a
  // wrapper and the Pressable keeps its pressed-state styling.
  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => onPress && press(0.985)}
        onPressOut={() => press(1)}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        style={({ pressed }) => [
          styles.card,
          isActive ? styles.spineActive : styles.spineInactive,
          pressed && onPress && styles.pressed,
        ]}
      >
        <View style={styles.body}>
          <View style={styles.codeTile}>
            <Ionicons
              name={actionIcon(permission.action)}
              size={18}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.details}>
            <View style={styles.topRow}>
              <Text style={styles.name} numberOfLines={2}>
                {permissionSentence(permission) || 'Unnamed permission'}
              </Text>
              <Badge
                label={isActive ? 'Active' : 'Inactive'}
                tone={isActive ? 'success' : 'neutral'}
              />
            </View>

            <Text style={styles.meta} numberOfLines={2}>
              {explanation}
            </Text>

            {hasCustomNote ? (
              <Text style={styles.note} numberOfLines={1}>
                "{permission.description.trim()}"
              </Text>
            ) : null}
          </View>

          {onPress ? (
            <Ionicons
              name="chevron-forward"
              size={15}
              color={theme.colors.textMuted}
              style={styles.chevron}
            />
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}
