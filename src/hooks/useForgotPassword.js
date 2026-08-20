import { useCallback, useState } from 'react';

import { normalizeError, isRateLimited } from '@utils/errors';
import * as authApi from '@services/auth';
import { useOtpTimer } from '@hooks/useOtpTimer';
import { normalizeEmail } from '@utils/format';

// One screen, two requests: `sendCode` asks for the code, `submitReset` spends
// it. See ResetPasswordForm for why no step can sit between them.
const OTP_FAILURE = /otp/i;

export function useForgotPassword() {
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isDone, setIsDone] = useState(false);
  const [sentEmail, setSentEmail] = useState(null);

  const timer = useOtpTimer();

  const clearMessages = useCallback(() => {
    setError(null);
    setNotice(null);
    setFieldErrors({});
  }, []);

  const handleFailure = useCallback((caught) => {
    const normalized = normalizeError(caught);

    // The backend's own wording wins. Its 429 here means "that code is dead",
    // where the generic "wait a moment" would advise the one useless thing.
    const message = normalized.hasServerMessage
      ? normalized.message
      : isRateLimited(normalized)
      ? 'Too many attempts. Please wait a moment before trying again.'
      : normalized.message;

    setError(message);

    // Anything said about the code belongs on the code boxes, not only the
    // banner. Real field errors from Joi still take precedence.
    setFieldErrors(
      OTP_FAILURE.test(normalized.message)
        ? { otp: normalized.message, ...normalized.fieldErrors }
        : normalized.fieldErrors
    );
  }, []);

  const sendCode = useCallback(
    async (value) => {
      if (isSending || isSubmitting) return false;

      setIsSending(true);
      clearMessages();

      try {
        await authApi.forgotPassword(value);

        const normalized = normalizeEmail(value);
        const isResend = sentEmail === normalized;

        setSentEmail(normalized);
        timer.start();
        setNotice(
          isResend
            ? 'A new code has been sent to your email.'
            : 'Code sent. Check your email.'
        );

        return true;
      } catch (caught) {
        handleFailure(caught);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [isSending, isSubmitting, sentEmail, clearMessages, handleFailure, timer]
  );

  // Both the verification and the reset, because the endpoint is both. Sends
  // `sentEmail`, not the box: the code was issued against that address.
  const submitReset = useCallback(
    async ({ otp, password }) => {
      if (isSending || isSubmitting || !sentEmail) return false;

      setIsSubmitting(true);
      clearMessages();

      try {
        await authApi.verifyForgotPasswordOtp(sentEmail, otp, password);

        setIsDone(true);
        return true;
      } catch (caught) {
        handleFailure(caught);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSending, isSubmitting, sentEmail, clearMessages, handleFailure]
  );

  return {
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
  };
}
