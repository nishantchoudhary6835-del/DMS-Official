import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { formatCountdown } from '@utils/format';
import { OTP_LENGTH, validateOtp } from '@validation/auth';

import { styles } from '@theme/styles/OtpStep.styles';

import { OtpInput } from './OtpInput';

export function OtpStep({
  email,
  onSubmit,
  onResend,
  isSubmitting,
  timer,
  hasError,
  onClearMessages,
}) {
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState(null);

  const lastAttemptedRef = useRef('');

  useEffect(() => {
    if (
      otp.length === OTP_LENGTH &&
      !isSubmitting &&
      !timer.isExpired &&
      lastAttemptedRef.current !== otp
    ) {
      lastAttemptedRef.current = otp;
      onSubmit(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, isSubmitting, timer.isExpired]);

  const handleChange = (value) => {
    setOtp(value);
    if (localError) setLocalError(null);
    onClearMessages();
  };

  const handleSubmit = async () => {
    const validationError = validateOtp(otp);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    await onSubmit(otp);
  };

  const handleResend = async () => {
    setOtp('');
    setLocalError(null);
    lastAttemptedRef.current = '';
    await onResend();
  };

  return (
    <View>
      <Text style={styles.title}>Check your email</Text>

      <Text style={styles.subtitle}>
        We sent a {OTP_LENGTH}-digit code to{' '}
        <Text style={styles.email}>{email}</Text>
      </Text>

      <OtpInput
        value={otp}
        onChangeText={handleChange}
        hasError={hasError || Boolean(localError)}
        editable={!isSubmitting && !timer.isExpired}
      />

      {localError ? <Text style={styles.error}>{localError}</Text> : null}

      <View style={styles.timerRow}>
        {timer.isExpired ? (
          <Text style={styles.expired}>
            That code has expired. Request a new one below.
          </Text>
        ) : (
          <Text style={styles.timer}>
            Code expires in {formatCountdown(timer.secondsLeft)}
          </Text>
        )}
      </View>

      <Button
        title="Verify"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={otp.length !== OTP_LENGTH || timer.isExpired}
        style={styles.action}
      />

      <Button
        title={
          timer.canResend
            ? 'Resend code'
            : `Resend available in ${formatCountdown(timer.secondsLeft)}`
        }
        onPress={handleResend}
        variant="text"
        disabled={!timer.canResend || isSubmitting}
      />
    </View>
  );
}
