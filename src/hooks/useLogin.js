import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as authApi from '@services/auth';
import { useAuth } from '@context/AuthContext';

export function useLogin() {
  const { signIn } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearError = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async ({ email, password }) => {
      if (isSubmitting) return false;

      setIsSubmitting(true);
      setError(null);
      setFieldErrors({});

      try {
        const response = await authApi.login(email, password);

        const signedInUser = response?.data?.user ?? null;

        if (!signedInUser) {
          setError('Sign in failed. Please try again.');
          return false;
        }

        await signIn(signedInUser);

        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 401) {
          setError('Invalid email or password.');
        } else {
          setError(normalized.message);
        }

        setFieldErrors(normalized.fieldErrors);

        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, signIn]
  );

  return { submit, isSubmitting, error, fieldErrors, clearError };
}
