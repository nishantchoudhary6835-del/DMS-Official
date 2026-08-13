import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { theme } from '@theme';
import { aclScopeDetail, ACL_EFFECT, ACL_STATUS, permissionRefLabel } from '@validation/acl';
import { labelFor } from '@validation/employee';
import { permissionEffectPhrase } from '@validation/permission';

import { styles } from '@theme/styles/AclCard.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export function AclCard({ acl, onPress }) {
  const isActive = acl.status === ACL_STATUS.ACTIVE;
  const isAllow = acl.effect === ACL_EFFECT.ALLOW;

  const permissionName = permissionRefLabel(acl.permission);
  const effectPhrase = permissionEffectPhrase(acl.permission);

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
              name={isAllow ? 'shield-checkmark-outline' : 'shield-outline'}
              size={18}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.details}>
            <View style={styles.topRow}>
              <Text style={styles.name} numberOfLines={2}>
                {labelFor(acl.hierarchyLevel) || 'Unknown level'}
              </Text>
              <Badge
                label={acl.effect ? (isAllow ? 'Allow' : 'Deny') : '—'}
                tone={isAllow ? 'success' : 'danger'}
              />
            </View>

            <Text
              style={permissionName ? styles.meta : styles.metaEmpty}
              numberOfLines={2}
            >
              {effectPhrase
                ? `${isAllow ? 'Can' : 'Cannot'} ${effectPhrase}`
                : permissionName
                ? `${isAllow ? 'Can' : 'Cannot'} ${permissionName}`
                : 'Permission unknown'}
            </Text>

            <Text style={styles.scopeMeta} numberOfLines={1}>
              {aclScopeDetail(acl)}
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
