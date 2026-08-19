import { useCallback, useState } from 'react';

import { useAuth } from '@context/AuthContext';
import { normalizeError } from '@utils/errors';
import * as authApi from '@services/auth';

export function useChangePassword() {
  const { user, signIn } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearMessages = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async (oldPassword, newPassword) => {
      if (isSubmitting) return false;

      setIsSubmitting(true);
      clearMessages();

      try {
        await authApi.changePassword(oldPassword, newPassword);

        // AUTH_PASSWORD.md §3: this invalidates the refresh token for every
        // session, including this one — without a fresh login the current
        // tab would silently die at its next access-token refresh (~15 min,
        // per AUTH_FLOW.md). Re-authenticate immediately with the new
        // password so the device the user is actually on stays signed in,
        // same as useRegistration's submitPassword does after register.
        try {
          const loginResponse = await authApi.login(user?.email, newPassword);
          const loggedInUser = loginResponse?.data?.user ?? null;

          if (loggedInUser) await signIn(loggedInUser);
        } catch {
          // Password changed successfully regardless; this session will just
          // sign out at its next refresh like every other device would.
        }

        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);
        setError(normalized.message);
        setFieldErrors(normalized.fieldErrors);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages, user, signIn]
  );

  return { submit, isSubmitting, error, fieldErrors, clearMessages };
}
