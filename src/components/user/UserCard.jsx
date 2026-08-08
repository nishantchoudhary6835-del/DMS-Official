import { Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { formatDate } from '@utils/format';
import { HIERARCHY_LABELS } from '@validation/employee';
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_TONES,
} from '@validation/user';

import { styles } from '@theme/styles/UserCard.styles';

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

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    >
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
            label={
              HIERARCHY_LABELS[employee.hierarchyLevel] ??
              employee.hierarchyLevel
            }
            tone="accent"
            style={styles.badgeGap}
          />
        ) : null}

        <Badge
          label={user.isEmailVerified ? 'Email verified' : 'Email unverified'}
          tone={user.isEmailVerified ? 'success' : 'neutral'}
          style={styles.badgeGap}
        />

        {isLocked ? (
          <Badge label="Locked" tone="danger" style={styles.badgeGap} />
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerLine}>
          {employee?.employeeId ? `${employee.employeeId} · ` : ''}
          {user.lastLogin
            ? `Last signed in ${formatDate(user.lastLogin)}`
            : 'Never signed in'}
        </Text>

        {failedAttempts > 0 ? (
          <Text style={styles.footerWarn}>
            {failedAttempts} failed sign-in{failedAttempts === 1 ? '' : 's'}
            {isLocked ? ` · locked until ${formatDate(user.lockUntil)}` : ''}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
