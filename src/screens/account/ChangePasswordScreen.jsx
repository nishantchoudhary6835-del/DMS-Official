import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { TextField } from '@components/common/TextField';
import { Screen } from '@components/layout/Screen';
import { PasswordRules } from '@components/auth/PasswordRules';
import { useToast } from '@context/ToastContext';
import { useChangePassword } from '@hooks/useChangePassword';
import {
  validateConfirmPassword,
  validateOldPassword,
  validatePassword,
} from '@validation/auth';

import { styles } from '@theme/styles/ChangePasswordScreen.styles';

export function ChangePasswordScreen({ navigation }) {
  const toast = useToast();
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useChangePassword();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localErrors, setLocalErrors] = useState({});

  const oldPasswordError = fieldErrors.oldPassword || localErrors.oldPassword;
  const newPasswordError = fieldErrors.newPassword || localErrors.newPassword;
  const confirmError = localErrors.confirmPassword;

  const setField = (setter, key) => (value) => {
    setter(value);
    setLocalErrors((prev) => ({ ...prev, [key]: undefined }));
    clearMessages();
  };

  const handleSubmit = async () => {
    const errors = {
      oldPassword: validateOldPassword(oldPassword),
      newPassword: validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(confirmPassword, newPassword),
    };

    if (errors.oldPassword || errors.newPassword || errors.confirmPassword) {
      setLocalErrors(errors);
      return;
    }

    const succeeded = await submit(oldPassword, newPassword);

    if (succeeded) {
      toast.success('Password changed.');
      navigation.goBack();
    }
  };

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

      <Text style={styles.title}>Change password</Text>
      <Text style={styles.subtitle}>
        This signs you out of every other device you're logged in on. You'll
        stay signed in here.
      </Text>

      <View style={styles.card}>
        <ErrorBanner message={error} />

        <TextField
          label="Current password"
          value={oldPassword}
          onChangeText={setField(setOldPassword, 'oldPassword')}
          error={oldPasswordError}
          placeholder="Enter your current password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          autoComplete="current-password"
          editable={!isSubmitting}
        />

        <TextField
          label="New password"
          value={newPassword}
          onChangeText={setField(setNewPassword, 'newPassword')}
          error={newPasswordError}
          placeholder="Enter a new password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="new-password"
          editable={!isSubmitting}
        />

        <PasswordRules password={newPassword} visible={newPassword.length > 0} />

        <TextField
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setField(setConfirmPassword, 'confirmPassword')}
          error={confirmError}
          placeholder="Re-enter your new password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="new-password"
          editable={!isSubmitting}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        <Button
          title="Change password"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.action}
        />
      </View>
    </Screen>
  );
}
