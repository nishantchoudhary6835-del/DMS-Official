import { Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { Button } from '@components/common/Button';
import { Screen } from '@components/layout/Screen';
import { useAuth } from '@context/AuthContext';
import { formatDate, formatDateTime, initialsOf } from '@utils/format';
import { EMPLOYEE_STATUS, labelFor } from '@validation/employee';
import { employeeRefLabel } from '@validation/workflow';

import { styles } from '@theme/styles/ProfileScreen.styles';

function Row({ label, value, fallback = 'Not set', divider = false }) {
  return (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={value ? styles.rowValue : styles.rowValueMuted}>
        {value || fallback}
      </Text>
    </View>
  );
}

/** "Amit Shinde · EMP-TL-001" for a populated employee reference. */
function personLabel(reference) {
  if (!reference || typeof reference !== 'object') return null;

  const name = employeeRefLabel(reference);

  return name && reference.employeeId && name !== reference.employeeId
    ? `${name} · ${reference.employeeId}`
    : name;
}

/**
 * Everything here comes from the sign-in response, which populates
 * `user.employeeId` with the employee record and, since a recent backend
 * change, its `department` and `team` as full objects with their head and
 * team lead attached. No request is made — and none could be, for most
 * accounts: GET /department and GET /team are permission-gated and answer 403
 * to anyone below Executive, so the login payload is the only place a regular
 * employee can learn their own department's name.
 *
 * The flip side is that it is a snapshot, cached in storage for the session.
 * A transfer made by an administrator will not show here until the next sign
 * in, which the footnote says outright rather than letting a stale team read
 * as current.
 */
export function ProfileScreen({ navigation }) {
  const { user } = useAuth();

  const employee =
    user?.employeeId && typeof user.employeeId === 'object'
      ? user.employeeId
      : null;

  const back = (
    <View style={styles.header}>
      <Button
        title="Back"
        icon="chevron-back"
        onPress={() => navigation.goBack()}
        variant="text"
        fullWidth={false}
      />
    </View>
  );

  // A session restored from storage that predates the populated login
  // response has a bare ObjectId here and nothing to show. It self-heals on
  // the next sign-in, so say that rather than rendering a page of blanks.
  if (!employee) {
    return (
      <Screen padded={false} style={styles.page}>
        {back}
        <View style={styles.centred}>
          <Text style={styles.emptyTitle}>Profile unavailable</Text>
          <Text style={styles.emptyBody}>
            This session was started before your employee details were included
            in sign-in. Sign out and back in to see them.
          </Text>
        </View>
      </Screen>
    );
  }

  const name = employeeRefLabel(employee) || 'Your account';
  const [firstName = '', lastName = ''] = String(name).trim().split(/\s+/);

  const department = employee.department ?? null;
  const team = employee.team ?? null;

  const isActive = employee.status === EMPLOYEE_STATUS.ACTIVE;

  return (
    <Screen padded={false} style={styles.page}>
      {back}

      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>
            {initialsOf(firstName, lastName, employee.email || user?.email)}
          </Text>
        </View>

        <Text style={styles.name}>{name}</Text>

        {employee.employeeId ? (
          <Text style={styles.code}>{employee.employeeId}</Text>
        ) : null}

        <View style={styles.badges}>
          {employee.hierarchyLevel ? (
            <Badge label={labelFor(employee.hierarchyLevel)} tone="info" />
          ) : null}
          {employee.status ? (
            <Badge
              label={isActive ? 'Active' : 'Inactive'}
              tone={isActive ? 'success' : 'neutral'}
            />
          ) : null}
        </View>
      </View>

      <Text style={styles.sectionLabel}>Employee</Text>
      <View style={styles.section}>
        <Row label="Work email" value={employee.email} />
        <Row
          label="Hierarchy level"
          value={labelFor(employee.hierarchyLevel)}
          divider
        />
        <Row
          label="Reporting manager"
          value={personLabel(employee.reportingManager)}
          fallback="Not assigned"
          divider
        />
      </View>

      <Text style={styles.sectionLabel}>Department</Text>
      <View style={styles.section}>
        <Row
          label="Name"
          value={department?.name}
          fallback="Not assigned"
        />
        <Row
          label="Head"
          value={personLabel(department?.head)}
          fallback="Not assigned"
          divider
        />
      </View>

      <Text style={styles.sectionLabel}>Team</Text>
      <View style={styles.section}>
        <Row label="Name" value={team?.name} fallback="Not assigned" />
        <Row
          label="Team lead"
          value={personLabel(team?.teamLead)}
          fallback="Not assigned"
          divider
        />
      </View>

      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.section}>
        <Row label="Sign-in email" value={user?.email} />
        <Row
          label="Email verified"
          value={user?.isEmailVerified ? 'Yes' : 'No'}
          divider
        />
        <Row label="Account status" value={user?.accountStatus} divider />
        <Row
          label="Last sign-in"
          value={formatDateTime(user?.lastLogin)}
          fallback="This session"
          divider
        />
        <Row
          label="Member since"
          value={formatDate(user?.createdAt)}
          divider
        />
      </View>

      <Text style={styles.note}>
        These details were read when you signed in. If an administrator moves
        you to another department or team, it appears here after your next sign
        in.
      </Text>
    </Screen>
  );
}
