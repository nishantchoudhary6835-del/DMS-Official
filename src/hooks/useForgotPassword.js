import { useCallback, useState } from 'react';

import { normalizeError, isRateLimited } from '@utils/errors';
import * as authApi from '@services/auth';
import { useOtpTimer } from '@hooks/useOtpTimer';
import { normalizeEmail } from '@utils/format';

/**
 * One screen, two requests.
 *
 * `sendCode` asks for the code; `submitReset` spends it. There is no step in
 * between because the backend has nowhere to put one: POST
 * /auth/verify-forgot-password-otp is the only route that can read a
 * PASSWORD_RESET OTP, its Joi schema requires `newPassword`, and on a correct
 * code it writes that password immediately. Checking and writing are the same
 * operation, so no request exists that could gate a separate OTP step.
 *
 * (Registration does have one — POST /auth/verify-email-otp compares the code,
 * sets `verified: true` and returns, and POST /auth/register then refuses
 * without that flag. That split is why RegisterScreen can be three steps and
 * this cannot.)
 *
 * `sentEmail` is the address a code actually went to, kept separately from
 * whatever is currently typed in the box. Editing the email after sending
 * leaves the code belonging to the old address, and the form uses this to
 * notice.
 */
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

    // The backend's own wording wins where it has any. Its 429 here means
    // "that code is dead, request a new one" — the generic "wait a moment"
    // would send the reader to do the one thing that cannot help.
    const message = normalized.hasServerMessage
      ? normalized.message
      : isRateLimited(normalized)
      ? 'Too many attempts. Please wait a moment before trying again.'
      : normalized.message;

    setError(message);

    // Anything the endpoint says about the code belongs on the code boxes,
    // not only in the banner, so the correction is asked for where the
    // mistake was made. Real field errors from Joi still take precedence.
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

  /**
   * Both the verification and the reset, because the endpoint is both. A
   * failure changes nothing on screen — the form still holds everything that
   * was typed, and only the part the backend objected to needs correcting.
   *
   * Sends `sentEmail` rather than whatever is in the box: the code was issued
   * against that address, and posting a different one would fail as
   * "Password reset OTP not found", which reads like the code was wrong.
   */
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
