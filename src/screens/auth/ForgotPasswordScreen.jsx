import { Text, View } from 'react-native';

import { BrandMark } from '@components/common/BrandMark';
import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Screen } from '@components/layout/Screen';
import { ResetPasswordForm } from '@components/auth/ResetPasswordForm';
import { useForgotPassword } from '@hooks/useForgotPassword';

import { styles } from '@theme/styles/ForgotPasswordScreen.styles';

/**
 * A single screen rather than a wizard — see useForgotPassword's header for
 * why the backend leaves no step boundary to put one on. With no steps there
 * is no in-screen back navigation either, so Back simply leaves, and the
 * hardware back button needs no interception.
 */
export function ForgotPasswordScreen({ navigation }) {
  const {
    sentEmail,
    isSending,
    isSubmitting,
    error,
    notice,
    fieldErrors,
    timer,
    isDone,
    sendCode,
    submitReset,
    clearMessages,
  } = useForgotPassword();

  if (isDone) {
    return (
      <Screen>
        <BrandMark size="small" style={styles.brand} />

        <Text style={styles.title}>Password reset</Text>
        <Text style={styles.subtitle}>
          Your password has been reset. Sign in with your new password —
          you&apos;ll need to on any other device too, since this also signed
          out your other sessions.
        </Text>

        <Button
          title="Back to sign in"
          onPress={() => navigation.goBack()}
          style={styles.action}
        />
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
          disabled={isSending || isSubmitting}
        />
      </View>

      <BrandMark size="small" style={styles.brand} />

      <ErrorBanner message={error} />
      <ErrorBanner message={notice} variant="success" />

      <ResetPasswordForm
        sentEmail={sentEmail}
        onSendCode={sendCode}
        onSubmit={submitReset}
        isSending={isSending}
        isSubmitting={isSubmitting}
        timer={timer}
        fieldErrors={fieldErrors}
        onClearMessages={clearMessages}
      />
    </Screen>
  );
}
