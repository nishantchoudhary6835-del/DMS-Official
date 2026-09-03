import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { theme } from '@theme';
import { formatDateTime, initialsOf } from '@utils/format';
import { labelFor } from '@validation/employee';
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_SPINES,
  ACCOUNT_STATUS_TONES,
} from '@validation/user';

import { styles } from '@theme/styles/UserCard.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export function employeeOf(user) {
  const reference = user?.employeeId;

  if (!reference || typeof reference !== 'object') return null;

  return reference;
}

export function UserCard({ user, onPress }) {
  const employee = employeeOf(user);

  const fullName = employee
    ? [employee.firstName, employee.lastName].filter(Boolean).join(' ')
    : '';

  const status = user.accountStatus ?? 'INACTIVE';
  const isLocked = Boolean(user.lockUntil);
  const failedAttempts = Number(user.failedLoginAttempts ?? 0);

  const spineColor =
    theme.colors.spine[ACCOUNT_STATUS_SPINES[status] ?? 'neutral'];

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
          { borderLeftColor: spineColor },
          pressed && onPress && styles.pressed,
        ]}
      >
        <View style={styles.body}>
          <View style={[styles.avatar, isLocked && styles.avatarLocked]}>
            {isLocked ? (
              <Ionicons
                name="lock-closed"
                size={16}
                color={theme.colors.danger}
              />
            ) : (
              <Text style={styles.avatarLabel}>
                {initialsOf(employee?.firstName, employee?.lastName, user.email)}
              </Text>
            )}
          </View>

          <View style={styles.details}>
            <View style={styles.topRow}>
              <Text style={styles.name} numberOfLines={1}>
                {fullName || user.email}
              </Text>
              <Badge
                label={ACCOUNT_STATUS_LABELS[status] ?? status}
                tone={ACCOUNT_STATUS_TONES[status] ?? 'neutral'}
              />
            </View>

            <Text style={styles.email} numberOfLines={1}>
              {user.email}
            </Text>

            <View style={styles.metaRow}>
              {employee ? (
                <Badge
                  label={labelFor(employee.hierarchyLevel)}
                  tone="accent"
                  style={styles.badgeGap}
                />
              ) : null}

              <Badge
                label={
                  user.isEmailVerified ? 'Email verified' : 'Email unverified'
                }
                tone={user.isEmailVerified ? 'success' : 'neutral'}
                style={styles.badgeGap}
              />

              {isLocked ? (
                <Badge label="Locked" tone="danger" style={styles.badgeGap} />
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            {employee?.employeeId ? (
              <>
                <Text style={styles.code}>{employee.employeeId}</Text>
                <Text style={styles.footerDot}>·</Text>
              </>
            ) : null}
            <Text style={styles.footerLine} numberOfLines={1}>
              {user.lastLogin
                ? `Last signed in ${formatDateTime(user.lastLogin)}`
                : 'Never signed in'}
            </Text>
          </View>

          {failedAttempts > 0 ? (
            <Text style={styles.footerWarn}>
              {failedAttempts} failed sign-in{failedAttempts === 1 ? '' : 's'}
              {isLocked ? ` · locked until ${formatDateTime(user.lockUntil)}` : ''}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}
