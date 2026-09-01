import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Screen } from '@components/layout/Screen';
import { FormCard } from '@components/layout/FormCard';
import { TeamFormFields } from '@components/team/TeamFormFields';
import { useToast } from '@context/ToastContext';
import { useCreateTeam } from '@hooks/useCreateTeam';
import { useDepartmentOptions } from '@hooks/useDepartmentOptions';
import { useEmployeeOptions } from '@hooks/useEmployeeOptions';
import { TEAM_LEAD_LEVEL, validateTeamForm } from '@validation/team';

import { styles } from '@theme/styles/CreateTeamScreen.styles';

export function CreateTeamScreen({ navigation }) {
  const toast = useToast();
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useCreateTeam();

  const departments = useDepartmentOptions();

  // Filtered to Team Lead level: the backend rejects anyone else, so offering
  // them would only produce a failed save.
  const leads = useEmployeeOptions(null, { onlyLevel: TEAM_LEAD_LEVEL });

  const [values, setValues] = useState({
    name: '',
    department: null,
    teamLead: null,
  });
  const [localErrors, setLocalErrors] = useState({});

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

    const created = await submit(values);

    if (created) {
      toast.success('Team created.');
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <FormCard>
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

        <Text style={styles.title}>New team</Text>
        <Text style={styles.subtitle}>
          A team is a working group inside one department. Employees are then
          assigned to it from their own record.
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
            title="Create team"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.action}
          />
        </View>
      </FormCard>
    </Screen>
  );
}
