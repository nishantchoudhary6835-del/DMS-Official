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
import { REGISTRATION_STEPS, useRegistration } from '@hooks/useRegistration';

import { styles } from '@theme/styles/RegisterScreen.styles';

const STEP_ORDER = [
  REGISTRATION_STEPS.EMAIL,
  REGISTRATION_STEPS.OTP,
  REGISTRATION_STEPS.PASSWORD,
];

export function RegisterScreen({ navigation }) {
  const {
    step,
    email,
    isSubmitting,
    error,
    notice,
    fieldErrors,
    timer,
    submitEmail,
    submitOtp,
    submitPassword,
    resendOtp,
    goBack,
    clearMessages,
  } = useRegistration();

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

  return (
    <Screen>
      <View style={styles.header}>
        <Button
          title="← Back"
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

      {step === REGISTRATION_STEPS.EMAIL && (
        <EmailStep
          onSubmit={submitEmail}
          isSubmitting={isSubmitting}
          fieldErrors={fieldErrors}
          onClearMessages={clearMessages}
        />
      )}

      {step === REGISTRATION_STEPS.OTP && (
        <OtpStep
          email={email}
          onSubmit={submitOtp}
          onResend={resendOtp}
          isSubmitting={isSubmitting}
          timer={timer}
          hasError={Boolean(error)}
          onClearMessages={clearMessages}
        />
      )}

      {step === REGISTRATION_STEPS.PASSWORD && (
        <SetPasswordStep
          email={email}
          onSubmit={submitPassword}
          isSubmitting={isSubmitting}
          fieldErrors={fieldErrors}
          onClearMessages={clearMessages}
        />
      )}
    </Screen>
  );
}
