import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { theme } from '@theme';
import { labelFor } from '@validation/employee';
import { permissionEffectPhrase } from '@validation/permission';
import { permissionRefLabel, ROLE_PERMISSION_STATUS } from '@validation/rolePermission';

import { styles } from '@theme/styles/RolePermissionCard.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export function RolePermissionCard({ rolePermission, onPress }) {
  const isActive = rolePermission.status === ROLE_PERMISSION_STATUS.ACTIVE;

  // `permission` arrives populated from list/detail responses but may come
  // back bare from a write — same caveat as Team's department/teamLead. When
  // populated, the concrete effect phrase reads far more clearly than the
  // permission's bare name ("Create Team"), so it's preferred when available.
  const permissionName = permissionRefLabel(rolePermission.permission);
  const effectPhrase = permissionEffectPhrase(rolePermission.permission);

  const scale = useRef(new Animated.Value(1)).current;

  const press = (toValue) => {
    Animated.spring(scale, {
      toValue,
      speed: 44,
      bounciness: 0,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

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
          <View style={styles.glyph}>
            <Ionicons
              name="ribbon-outline"
              size={18}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.details}>
            <View style={styles.topRow}>
              <Text style={styles.name} numberOfLines={2}>
                {labelFor(rolePermission.hierarchyLevel) || 'Unknown level'}
              </Text>
              <Badge
                label={isActive ? 'Active' : 'Inactive'}
                tone={isActive ? 'success' : 'neutral'}
              />
            </View>

            <Text
              style={permissionName ? styles.meta : styles.metaEmpty}
              numberOfLines={2}
            >
              {effectPhrase
                ? `Eligible to ${effectPhrase}`
                : permissionName
                ? `Can ${permissionName}`
                : 'Permission unknown'}
            </Text>
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
