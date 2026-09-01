import { Text, View } from 'react-native';

import { BrandMark } from '@components/common/BrandMark';
import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { AuthShell } from '@components/layout/AuthShell';
import { Screen } from '@components/layout/Screen';
import { ResetPasswordForm } from '@components/auth/ResetPasswordForm';
import { useForgotPassword } from '@hooks/useForgotPassword';

import { styles } from '@theme/styles/ForgotPasswordScreen.styles';

// A single screen rather than a wizard — see useForgotPassword's header. With
// no steps, Back simply leaves and the hardware button needs no interception.
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
      <Screen padded={false}>
        <AuthShell brand={<BrandMark size="small" />}>
          <Text style={styles.title}>Password reset</Text>
          <Text style={styles.subtitle}>
            Your password has been reset. Sign in with your new password —
            you&apos;ll need to on any other device too, since this also
            signed out your other sessions.
          </Text>

          <Button
            title="Back to sign in"
            onPress={() => navigation.goBack()}
            style={styles.action}
          />
        </AuthShell>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <AuthShell brand={<BrandMark size="small" />}>
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
      </AuthShell>
    </Screen>
  );
}
