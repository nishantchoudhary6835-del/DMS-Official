import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { TextField } from '@components/common/TextField';
import { formatCountdown, normalizeEmail } from '@utils/format';
import {
  OTP_LENGTH,
  validateConfirmPassword,
  validateEmail,
  validateOtp,
  validatePassword,
} from '@validation/auth';

import { styles } from '@theme/styles/ResetPasswordForm.styles';

import { OtpInput } from './OtpInput';
import { PasswordRules } from './PasswordRules';

// The whole reset on one screen: verify-forgot-password-otp takes the code and
// the new password together and resets on the spot, so no step can gate it.
export function ResetPasswordForm({
  sentEmail,
  onSendCode,
  onSubmit,
  isSending,
  isSubmitting,
  timer,
  fieldErrors = {},
  onClearMessages,
}) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localErrors, setLocalErrors] = useState({});

  const isBusy = isSending || isSubmitting;

  // A code belongs to the address it was sent to, so editing the box re-locks
  // rather than letting someone spend it against an address that never got one.
  const hasCodeForThisEmail =
    Boolean(sentEmail) && normalizeEmail(email) === sentEmail;

  // The sections unlock in order. Nothing here checks whether the digits are
  // *correct* — only the backend can, and only on submit.
  const isCodeComplete = otp.length === OTP_LENGTH;
  const canEnterCode = hasCodeForThisEmail && !isBusy && !timer.isExpired;
  const canEnterPassword = canEnterCode && isCodeComplete;

  // `newPassword` is what the endpoint's Joi schema calls the field, so that
  // is the key a server-side validation error arrives under.
  const emailError = fieldErrors.email || localErrors.email;
  const otpError = fieldErrors.otp || localErrors.otp;
  const passwordError =
    fieldErrors.newPassword || fieldErrors.password || localErrors.password;
  const confirmError = localErrors.confirmPassword;

  const clearField = (key) => {
    setLocalErrors((prev) => ({ ...prev, [key]: undefined }));
    onClearMessages();
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    clearField('email');
  };

  const handleOtpChange = (value) => {
    setOtp(value);
    clearField('otp');
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    clearField('password');
  };

  const handleConfirmChange = (value) => {
    setConfirmPassword(value);
    clearField('confirmPassword');
  };

  const handleSendCode = async () => {
    const validationError = validateEmail(email);

    if (validationError) {
      setLocalErrors((prev) => ({ ...prev, email: validationError }));
      return;
    }

    // A fresh code makes any half-typed old one meaningless; the password is
    // still perfectly good, so it stays.
    setOtp('');
    setLocalErrors((prev) => ({ ...prev, otp: undefined }));

    await onSendCode(email);
  };

  const handleSubmit = async () => {
    const errors = {
      otp: validateOtp(otp),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    };

    if (errors.otp || errors.password || errors.confirmPassword) {
      setLocalErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    await onSubmit({ otp, password });
  };

  const canSend = Boolean(email.trim()) && !isBusy && (!hasCodeForThisEmail || timer.canResend);

  return (
    <View>
      <Text style={styles.title}>Reset your password</Text>

      <Text style={styles.subtitle}>
        We&apos;ll email you a {OTP_LENGTH}-digit code. Enter it below with the
        password you want to use — they&apos;re checked together, so a wrong
        code costs you nothing but the code.
      </Text>

      <View style={styles.sendRow}>
        <View style={styles.sendField}>
          <TextField
            compact
            label="Work email"
            value={email}
            onChangeText={handleEmailChange}
            error={emailError}
            placeholder="you@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            editable={!isBusy}
            returnKeyType="send"
            onSubmitEditing={handleSendCode}
          />
        </View>

        <Button
          title={
            hasCodeForThisEmail && !timer.canResend
              ? formatCountdown(timer.secondsLeft)
              : hasCodeForThisEmail
              ? 'Resend'
              : 'Send code'
          }
          onPress={handleSendCode}
          loading={isSending}
          disabled={!canSend}
          fullWidth={false}
          style={styles.sendButton}
        />
      </View>

      <View style={styles.divider} />

      <Text style={styles.fieldLabel}>Code from your email</Text>

      <OtpInput
        value={otp}
        onChangeText={handleOtpChange}
        hasError={Boolean(otpError)}
        editable={canEnterCode}
        autoFocus={false}
      />

      {otpError ? <Text style={styles.error}>{otpError}</Text> : null}

      {/* Silent in the untouched state — empty boxes under a Send button explain
          themselves. A countdown and a re-lock cannot be inferred by looking. */}
      {hasCodeForThisEmail || sentEmail ? (
        <View style={styles.statusRow}>
          {!hasCodeForThisEmail ? (
            <Text style={styles.waiting}>
              That is a different address — send a code to it to continue.
            </Text>
          ) : timer.isExpired ? (
            <Text style={styles.expired}>
              That code has expired. Send a new one above.
            </Text>
          ) : (
            <Text style={styles.timer}>
              Code expires in {formatCountdown(timer.secondsLeft)}
            </Text>
          )}
        </View>
      ) : null}

      <View style={styles.divider} />

      {/* Only once a code is in hand: before that the greyed fields follow from
          the greyed boxes, but the "all six" rule cannot be seen. */}
      {hasCodeForThisEmail && !canEnterPassword ? (
        <Text style={styles.lockNote}>
          Enter all {OTP_LENGTH} digits to choose a new password.
        </Text>
      ) : null}

      <TextField
        label="New password"
        value={password}
        onChangeText={handlePasswordChange}
        error={passwordError}
        placeholder="Enter a password"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="newPassword"
        autoComplete="new-password"
        editable={canEnterPassword}
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
        editable={canEnterPassword}
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />

      <Button
        title="Reset password"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={!canEnterPassword}
        style={styles.action}
      />
    </View>
  );
}
