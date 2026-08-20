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

        // §3: this invalidates every session's refresh token, including this
        // one. Re-authenticate now so the device the user is on stays signed in.
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
