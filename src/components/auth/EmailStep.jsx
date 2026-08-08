import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { TextField } from '@components/common/TextField';
import { validateEmail } from '@validation/auth';

import { styles } from '@theme/styles/EmailStep.styles';

export function EmailStep({
  onSubmit,
  isSubmitting,
  fieldErrors = {},
  onClearMessages,
}) {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState(null);

  const errorText = fieldErrors.email || localError;

  const handleChange = (value) => {
    setEmail(value);

    if (localError) setLocalError(null);
    onClearMessages();
  };

  const handleSubmit = async () => {
    const validationError = validateEmail(email);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    await onSubmit(email);
  };

  return (
    <View>
      <Text style={styles.title}>Set up your account</Text>

      <Text style={styles.subtitle}>
        Enter the work email your organisation registered for you. We&apos;ll send
        a 6-digit verification code to it.
      </Text>

      <TextField
        label="Work email"
        value={email}
        onChangeText={handleChange}
        error={errorText}
        placeholder="you@company.com"
        helper="This must be the email your administrator added to DMS."
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        editable={!isSubmitting}
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />

      <Button
        title="Send verification code"
        onPress={handleSubmit}
        loading={isSubmitting}
        style={styles.action}
      />
    </View>
  );
}
