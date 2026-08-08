import { useCallback, useRef, useState } from 'react';

import { normalizeError, isRateLimited } from '@utils/errors';
import * as authApi from '@services/auth';
import { useAuth } from '@context/AuthContext';
import { useOtpTimer } from '@hooks/useOtpTimer';

export const REGISTRATION_STEPS = {
  EMAIL: 'EMAIL',
  OTP: 'OTP',
  PASSWORD: 'PASSWORD',
};

export function useRegistration() {
  const { signIn } = useAuth();

  const [step, setStep] = useState(REGISTRATION_STEPS.EMAIL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [email, setEmail] = useState('');
  const emailRef = useRef('');

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
        await authApi.sendEmailOtp(value);

        emailRef.current = value;
        setEmail(value);

        timer.start();
        setStep(REGISTRATION_STEPS.OTP);

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
      await authApi.sendEmailOtp(emailRef.current);
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

      setIsSubmitting(true);
      clearMessages();

      try {
        await authApi.verifyEmailOtp(emailRef.current, otp);

        setStep(REGISTRATION_STEPS.PASSWORD);
        return true;
      } catch (caught) {
        handleFailure(caught);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages, handleFailure]
  );

  const submitPassword = useCallback(
    async ({ password, confirmPassword }) => {
      if (isSubmitting) return false;

      setIsSubmitting(true);
      clearMessages();

      try {
        await authApi.register({
          email: emailRef.current,
          password,
          confirmPassword,
        });

        try {
          const loginResponse = await authApi.login(emailRef.current, password);
          const loggedInUser = loginResponse?.data?.user ?? null;

          if (loggedInUser) {
            await signIn(loggedInUser);
            return true;
          }
        } catch {
          // Account exists; fall through to the sign-in prompt below.
        }

        setNotice(
          'Your account is ready. Please sign in with your new password.'
        );
        return true;
      } catch (caught) {
        handleFailure(caught);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages, handleFailure, signIn]
  );

  const goBack = useCallback(() => {
    clearMessages();

    if (step === REGISTRATION_STEPS.PASSWORD) {
      setStep(REGISTRATION_STEPS.OTP);
      return true;
    }

    if (step === REGISTRATION_STEPS.OTP) {
      timer.reset();
      setStep(REGISTRATION_STEPS.EMAIL);
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

    submitEmail,
    submitOtp,
    submitPassword,
    resendOtp,
    goBack,
    clearMessages,
  };
}
