import { Platform } from 'react-native';

import { theme } from '@theme';

// macOS/trackpad browsers render an overlay scrollbar that fades out at
// rest, which makes a list with more content below the fold look identical
// to one that doesn't have any. Forcing a persistent, styled scrollbar
// removes that ambiguity — run once, idempotent, web only.
export function installPersistentScrollbars() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById('persistent-scrollbars')) return;

  const style = document.createElement('style');
  style.id = 'persistent-scrollbars';
  style.textContent = `
    * {
      scrollbar-width: thin;
      scrollbar-color: ${theme.colors.border} transparent;
    }
    *::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    *::-webkit-scrollbar-track {
      background: transparent;
    }
    *::-webkit-scrollbar-thumb {
      background-color: ${theme.colors.border};
      border-radius: 8px;
    }
    *::-webkit-scrollbar-thumb:hover {
      background-color: ${theme.colors.textMuted};
    }
  `;
  document.head.appendChild(style);
}
