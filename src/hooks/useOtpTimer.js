import { useCallback, useEffect, useRef, useState } from 'react';

import { OTP_VALIDITY_SECONDS } from '@validation/auth';

export function useOtpTimer({
  durationSeconds = OTP_VALIDITY_SECONDS,
  autoStart = false,
} = {}) {
  const expiresAtRef = useRef(null);

  const [secondsLeft, setSecondsLeft] = useState(autoStart ? durationSeconds : 0);
  const [isRunning, setIsRunning] = useState(autoStart);

  const start = useCallback(() => {
    expiresAtRef.current = Date.now() + durationSeconds * 1000;
    setSecondsLeft(durationSeconds);
    setIsRunning(true);
  }, [durationSeconds]);

  const reset = useCallback(() => {
    expiresAtRef.current = null;
    setSecondsLeft(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning) return undefined;

    if (autoStart && expiresAtRef.current === null) {
      expiresAtRef.current = Date.now() + durationSeconds * 1000;
    }

    const tick = () => {
      if (expiresAtRef.current === null) return;

      const remainingMs = expiresAtRef.current - Date.now();
      const remaining = Math.max(0, Math.ceil(remainingMs / 1000));

      setSecondsLeft(remaining);

      if (remaining === 0) {
        setIsRunning(false);
      }
    };

    tick();

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, autoStart, durationSeconds]);

  const isExpired = secondsLeft === 0 && expiresAtRef.current !== null;

  return {
    secondsLeft,
    isExpired,
    canResend: isExpired,
    isRunning,
    start,
    reset,
  };
}
