import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { TextField } from '@components/common/TextField';
import {
  validateConfirmPassword,
  validatePassword,
} from '@validation/auth';

import { styles } from '@theme/styles/SetPasswordStep.styles';

import { PasswordRules } from './PasswordRules';

export function SetPasswordStep({
  email,
  onSubmit,
  isSubmitting,
  fieldErrors = {},
  onClearMessages,
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localErrors, setLocalErrors] = useState({});

  const passwordError = fieldErrors.password || localErrors.password;
  const confirmError = fieldErrors.confirmPassword || localErrors.confirmPassword;

  const handlePasswordChange = (value) => {
    setPassword(value);
    setLocalErrors((prev) => ({ ...prev, password: undefined }));
    onClearMessages();
  };

  const handleConfirmChange = (value) => {
    setConfirmPassword(value);
    setLocalErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    onClearMessages();
  };

  const handleSubmit = async () => {
    const errors = {
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    };

    if (errors.password || errors.confirmPassword) {
      setLocalErrors(errors);
      return;
    }

    await onSubmit({ password, confirmPassword });
  };

  return (
    <View>
      <Text style={styles.title}>Create your password</Text>

      <Text style={styles.subtitle}>
        Your email is verified. Choose a password to finish setting up{' '}
        <Text style={styles.email}>{email}</Text>.
      </Text>

      <TextField
        label="Password"
        value={password}
        onChangeText={handlePasswordChange}
        error={passwordError}
        placeholder="Enter a password"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="newPassword"
        autoComplete="new-password"
        editable={!isSubmitting}
      />

      <PasswordRules password={password} visible={password.length > 0} />

      <TextField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={handleConfirmChange}
        error={confirmError}
        placeholder="Re-enter your password"
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
        title="Create account"
        onPress={handleSubmit}
        loading={isSubmitting}
        style={styles.action}
      />
    </View>
  );
}
