import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { EmployeeFormFields } from '@components/employee/EmployeeFormFields';
import { Screen } from '@components/layout/Screen';
import { useToast } from '@context/ToastContext';
import { useDepartmentOptions } from '@hooks/useDepartmentOptions';
import { useEmployee } from '@hooks/useEmployee';
import { useEmployeeOptions } from '@hooks/useEmployeeOptions';
import { useHierarchy } from '@hooks/useHierarchy';
import { useTeamOptions } from '@hooks/useTeamOptions';
import { useUpdateEmployee } from '@hooks/useUpdateEmployee';
import { referenceId } from '@utils/format';
import { allowedLevelsFor, validateEmployeeForm } from '@validation/employee';

import { styles } from '@theme/styles/EditEmployeeScreen.styles';

function toFormValues(employee) {
  return {
    employeeId: employee.employeeId ?? '',
    firstName: employee.firstName ?? '',
    lastName: employee.lastName ?? '',
    email: employee.email ?? '',
    hierarchyLevel: employee.hierarchyLevel ?? null,
    department: referenceId(employee.department),
    team: referenceId(employee.team),
    reportingManager: referenceId(employee.reportingManager),
  };
}

function changedFields(initial, current) {
  if (!initial || !current) return {};

  return Object.keys(current).reduce((changes, key) => {
    if (current[key] !== initial[key]) changes[key] = current[key];
    return changes;
  }, {});
}

export function EditEmployeeScreen({ navigation, route }) {
  const { employeeId } = route.params ?? {};
  const toast = useToast();

  const {
    employee,
    isLoading,
    error: loadError,
    isForbidden,
    isNotFound,
    refresh,
  } = useEmployee(employeeId);

  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useUpdateEmployee();

  const hierarchy = useHierarchy();
  const departments = useDepartmentOptions();

  const [initial, setInitial] = useState(null);
  const [values, setValues] = useState(null);
  const [localErrors, setLocalErrors] = useState({});

  // Declared after `values` so the candidate list narrows as soon as the
  // hierarchy level changes.
  const managers = useEmployeeOptions(employeeId, {
    hierarchyLevel: values?.hierarchyLevel,
    ranks: hierarchy.ranks,
  });

  useEffect(() => {
    if (!employee) return;

    const next = toFormValues(employee);

    setInitial(next);
    setValues(next);
  }, [employee]);

  const teams = useTeamOptions(values?.department);

  // The employee's own team may be inactive or in another department, so it is
  // absent from the fetched list. The populated reference recovers its name.
  const allTeams = useMemo(() => {
    const own = employee?.team;
    const extra = own && typeof own === 'object' ? [own] : [];

    return [...teams.teams, ...extra];
  }, [teams.teams, employee]);

  const changes = useMemo(
    () => changedFields(initial, values),
    [initial, values]
  );

  const hasChanges = Object.keys(changes).length > 0;

  // Grandfathers the level this employee already has — see allowedLevelsFor.
  const allowedLevels = useMemo(
    () => allowedLevelsFor(hierarchy.levels, initial?.hierarchyLevel),
    [hierarchy.levels, initial]
  );

  const setField = (key, value) => {
    setValues((prev) => {
      // Promoting someone can leave their manager too junior to still be a
      // candidate. Clearing it forces a choice rather than hiding the mismatch.
      if (key === 'hierarchyLevel' && prev.hierarchyLevel !== value) {
        return { ...prev, hierarchyLevel: value, reportingManager: null };
      }

      // A team belongs to exactly one department, so moving someone between
      // departments cannot carry their old team across.
      if (key === 'department' && prev.department !== value) {
        return { ...prev, department: value, team: null };
      }

      return { ...prev, [key]: value };
    });
    setLocalErrors((prev) => ({ ...prev, [key]: undefined }));
    clearMessages();
  };

  const errorFor = (key) => fieldErrors[key] || localErrors[key];

  const handleSubmit = async () => {
    const { errors, hasError } = validateEmployeeForm(values, allowedLevels);

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const updated = await submit(employeeId, changes);

    if (updated) {
      toast.success('Employee updated.');
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <Loader message="Loading employee…" fullScreen={false} />
      </Screen>
    );
  }

  if (loadError || !values) {
    return (
      <Screen>
        <View style={styles.header}>
          <Button
            title="Back"
          icon="chevron-back"
            onPress={() => navigation.goBack()}
            variant="text"
            fullWidth={false}
          />
        </View>

        <View style={styles.errorBlock}>
          <ErrorBanner message={loadError ?? 'Employee not found.'} />
          {!isForbidden && !isNotFound ? (
            <Button
              title="Try again"
              onPress={refresh}
              variant="secondary"
              fullWidth={false}
            />
          ) : null}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Button
          title="Back"
          icon="chevron-back"
          onPress={() => navigation.goBack()}
          variant="text"
          fullWidth={false}
          disabled={isSubmitting}
        />
      </View>

      <Text style={styles.title}>Edit employee</Text>
      <Text style={styles.subtitle}>
        Only the fields you change are sent. Registration state is managed by the
        backend and cannot be edited here.
      </Text>

      <View style={styles.card}>
        <ErrorBanner message={error} />

        <EmployeeFormFields
          values={values}
          setField={setField}
          errorFor={errorFor}
          hierarchyOptions={hierarchy.options}
          hierarchyHelper={
            hierarchy.isFallback && !hierarchy.isLoading
              ? "Showing the standard list — the server's list is unavailable."
              : undefined
          }
          departmentOptions={departments.options}
          allDepartments={departments.departments}
          teamOptions={teams.options}
          allTeams={allTeams}
          managerOptions={managers.options}
          managerHiddenCount={managers.hiddenCount}
          managerHelper="This employee cannot be their own manager."
          disabled={isSubmitting}
        />

        <Button
          title={hasChanges ? 'Save changes' : 'No changes yet'}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!hasChanges}
          style={styles.action}
        />
      </View>
    </Screen>
  );
}
