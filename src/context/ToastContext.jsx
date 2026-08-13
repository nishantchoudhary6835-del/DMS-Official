import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';

import { ToastHost } from '@components/common/ToastHost';

const ToastContext = createContext(null);

let nextId = 0;
const DEFAULT_DURATION = 3200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (type, message, duration = DEFAULT_DURATION) => {
      if (!message) return;

      const id = ++nextId;
      setToasts((prev) => [...prev, { id, type, message }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (message, duration) => show('success', message, duration),
      error: (message, duration) => show('error', message, duration),
      info: (message, duration) => show('info', message, duration),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={toast}>
      <View style={{ flex: 1 }}>
        {children}
        <ToastHost toasts={toasts} onDismiss={dismiss} />
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }

  return context;
}
