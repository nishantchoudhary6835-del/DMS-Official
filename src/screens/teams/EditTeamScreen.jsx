import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { TeamFormFields } from '@components/team/TeamFormFields';
import { useToast } from '@context/ToastContext';
import { useDepartmentOptions } from '@hooks/useDepartmentOptions';
import { useEmployeeOptions } from '@hooks/useEmployeeOptions';
import { useTeam } from '@hooks/useTeam';
import { useUpdateTeam } from '@hooks/useUpdateTeam';
import { referenceId } from '@utils/format';
import { TEAM_LEAD_LEVEL, validateTeamForm } from '@validation/team';

import { styles } from '@theme/styles/EditTeamScreen.styles';

function toFormValues(team) {
  return {
    name: team.name ?? '',
    // Both arrive populated on a read and have to be flattened to ids before
    // they can drive a Select.
    department: referenceId(team.department),
    teamLead: referenceId(team.teamLead),
  };
}

function changedFields(initial, current) {
  if (!initial || !current) return {};

  return Object.keys(current).reduce((changes, key) => {
    if (current[key] !== initial[key]) changes[key] = current[key];
    return changes;
  }, {});
}

export function EditTeamScreen({ navigation, route }) {
  const { teamId } = route.params ?? {};
  const toast = useToast();

  const {
    team,
    isLoading,
    error: loadError,
    isForbidden,
    isNotFound,
    refresh,
  } = useTeam(teamId);

  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useUpdateTeam();

  const departments = useDepartmentOptions();
  const leads = useEmployeeOptions(null, { onlyLevel: TEAM_LEAD_LEVEL });

  const [initial, setInitial] = useState(null);
  const [values, setValues] = useState(null);
  const [localErrors, setLocalErrors] = useState({});

  useEffect(() => {
    if (!team) return;

    const next = toFormValues(team);

    setInitial(next);
    setValues(next);
  }, [team]);

  const changes = useMemo(
    () => changedFields(initial, values),
    [initial, values]
  );

  const hasChanges = Object.keys(changes).length > 0;

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setLocalErrors((prev) => ({ ...prev, [key]: undefined }));
    clearMessages();
  };

  const errorFor = (key) => fieldErrors[key] || localErrors[key];

  const handleSubmit = async () => {
    const { errors, hasError } = validateTeamForm(values);

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const updated = await submit(teamId, changes);

    if (updated) {
      toast.success('Team updated.');
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <Loader message="Loading team…" fullScreen={false} />
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
          <ErrorBanner message={loadError ?? 'Team not found.'} />
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

      <Text style={styles.title}>Edit team</Text>
      <Text style={styles.subtitle}>
        Only the fields you change are sent. Moving a team to another
        department does not move the employees already in it.
      </Text>

      <View style={styles.card}>
        <ErrorBanner message={error} />

        <TeamFormFields
          values={values}
          setField={setField}
          errorFor={errorFor}
          departmentOptions={departments.options}
          leadOptions={leads.options}
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
