import { useCallback } from 'react';
import { BackHandler, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { BrandMark } from '@components/common/BrandMark';
import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Screen } from '@components/layout/Screen';
import { EmailStep } from '@components/auth/EmailStep';
import { OtpStep } from '@components/auth/OtpStep';
import { SetPasswordStep } from '@components/auth/SetPasswordStep';
import {
  FORGOT_PASSWORD_STEPS,
  useForgotPassword,
} from '@hooks/useForgotPassword';

import { styles } from '@theme/styles/ForgotPasswordScreen.styles';

const STEP_ORDER = [
  FORGOT_PASSWORD_STEPS.EMAIL,
  FORGOT_PASSWORD_STEPS.OTP,
  FORGOT_PASSWORD_STEPS.PASSWORD,
];

export function ForgotPasswordScreen({ navigation }) {
  const {
    step,
    email,
    isSubmitting,
    error,
    notice,
    fieldErrors,
    timer,
    isDone,
    submitEmail,
    submitOtp,
    submitPassword,
    resendOtp,
    goBack,
    clearMessages,
  } = useForgotPassword();

  const handleBack = useCallback(() => {
    const consumed = goBack();

    if (!consumed) {
      navigation.goBack();
    }

    return true;
  }, [goBack, navigation]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBack
      );

      return () => subscription.remove();
    }, [handleBack])
  );

  const stepIndex = STEP_ORDER.indexOf(step);

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
          onPress={handleBack}
          variant="text"
          fullWidth={false}
          disabled={isSubmitting}
        />
        <Text style={styles.progress}>
          Step {stepIndex + 1} of {STEP_ORDER.length}
        </Text>
      </View>

      <BrandMark size="small" style={styles.brand} />

      <ErrorBanner message={error} />
      <ErrorBanner message={notice} variant="success" />

      {step === FORGOT_PASSWORD_STEPS.EMAIL && (
        <EmailStep
          onSubmit={submitEmail}
          isSubmitting={isSubmitting}
          fieldErrors={fieldErrors}
          onClearMessages={clearMessages}
          title="Reset your password"
          subtitle="Enter the email on your account. We'll send a 6-digit code to reset your password."
          helper="This must be the email your administrator added to DMS."
          buttonLabel="Send reset code"
        />
      )}

      {step === FORGOT_PASSWORD_STEPS.OTP && (
        <OtpStep
          email={email}
          onSubmit={submitOtp}
          onResend={resendOtp}
          isSubmitting={isSubmitting}
          timer={timer}
          hasError={Boolean(error)}
          onClearMessages={clearMessages}
          // Advancing here is instant — there's nothing to verify against the
          // server yet — so auto-submitting on the sixth digit would jump
          // straight to the password form the moment the code was typed or
          // pasted. See OtpStep's header comment.
          autoSubmit={false}
        />
      )}

      {step === FORGOT_PASSWORD_STEPS.PASSWORD && (
        <SetPasswordStep
          email={email}
          onSubmit={submitPassword}
          isSubmitting={isSubmitting}
          fieldErrors={fieldErrors}
          onClearMessages={clearMessages}
          title="Choose a new password"
          subtitle="We'll verify your code and update your password when you continue."
          buttonLabel="Reset password"
        />
      )}
    </Screen>
  );
}
