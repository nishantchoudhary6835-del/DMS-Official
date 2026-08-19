import { useCallback, useRef, useState } from 'react';

import { normalizeError, isRateLimited } from '@utils/errors';
import * as authApi from '@services/auth';
import { useOtpTimer } from '@hooks/useOtpTimer';
import { validateOtp } from '@validation/auth';

export const FORGOT_PASSWORD_STEPS = {
  EMAIL: 'EMAIL',
  OTP: 'OTP',
  PASSWORD: 'PASSWORD',
};

/**
 * Unlike registration, the backend has no separate "verify OTP" call for
 * password reset — verify-forgot-password-otp takes the OTP and the new
 * password together in one request (AUTH_PASSWORD.md §2). The OTP step
 * below still only validates the format and moves on, matching the
 * registration screen's step feel; the actual verification (and any
 * "invalid OTP" error) only happens when the password step submits.
 */
export function useForgotPassword() {
  const [step, setStep] = useState(FORGOT_PASSWORD_STEPS.EMAIL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isDone, setIsDone] = useState(false);

  const [email, setEmail] = useState('');
  const emailRef = useRef('');
  const otpRef = useRef('');

  const timer = useOtpTimer();

  const clearMessages = useCallback(() => {
    setError(null);
    setNotice(null);
    setFieldErrors({});
  }, []);

  const handleFailure = useCallback((caught) => {
    const normalized = normalizeError(caught);

    setError(
      isRateLimited(normalized)
        ? 'Too many attempts. Please wait a moment before trying again.'
        : normalized.message
    );
    setFieldErrors(normalized.fieldErrors);
  }, []);

  const submitEmail = useCallback(
    async (value) => {
      if (isSubmitting) return false;

      setIsSubmitting(true);
      clearMessages();

      try {
        await authApi.forgotPassword(value);

        emailRef.current = value;
        setEmail(value);

        timer.start();
        setStep(FORGOT_PASSWORD_STEPS.OTP);

        return true;
      } catch (caught) {
        handleFailure(caught);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages, handleFailure, timer]
  );

  const resendOtp = useCallback(async () => {
    if (isSubmitting || !timer.canResend) return false;

    setIsSubmitting(true);
    clearMessages();

    try {
      await authApi.forgotPassword(emailRef.current);
      timer.start();
      setNotice('A new code has been sent to your email.');
      return true;
    } catch (caught) {
      handleFailure(caught);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, timer, clearMessages, handleFailure]);

  const submitOtp = useCallback(
    async (otp) => {
      if (isSubmitting) return false;

      const validationError = validateOtp(otp);
      if (validationError) {
        setError(validationError);
        return false;
      }

      clearMessages();
      otpRef.current = otp;
      setStep(FORGOT_PASSWORD_STEPS.PASSWORD);
      return true;
    },
    [isSubmitting, clearMessages]
  );

  const submitPassword = useCallback(
    async ({ password }) => {
      if (isSubmitting) return false;

      setIsSubmitting(true);
      clearMessages();

      try {
        await authApi.verifyForgotPasswordOtp(
          emailRef.current,
          otpRef.current,
          password
        );

        setIsDone(true);
        return true;
      } catch (caught) {
        handleFailure(caught);

        // Every failure this endpoint documents (invalid OTP, expired OTP,
        // exhausted attempts) is really an OTP problem, not a password one —
        // there's no separate verify-OTP call, so this is the only place
        // that finds out. Send them back to re-enter the code instead of
        // stranding them on the password screen with an OTP error.
        otpRef.current = '';
        setStep(FORGOT_PASSWORD_STEPS.OTP);

        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages, handleFailure]
  );

  const goBack = useCallback(() => {
    clearMessages();

    if (step === FORGOT_PASSWORD_STEPS.PASSWORD) {
      setStep(FORGOT_PASSWORD_STEPS.OTP);
      return true;
    }

    if (step === FORGOT_PASSWORD_STEPS.OTP) {
      timer.reset();
      setStep(FORGOT_PASSWORD_STEPS.EMAIL);
      return true;
    }

    return false;
  }, [step, clearMessages, timer]);

  return {
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
  };
}
