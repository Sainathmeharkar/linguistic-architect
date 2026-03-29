// src/hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      shortcuts.forEach(({ key, ctrlKey = false, shiftKey = false, callback }) => {
        const isKeyMatch = e.key.toLowerCase() === key.toLowerCase();
        const isCtrlMatch = ctrlKey === (e.ctrlKey || e.metaKey);
        const isShiftMatch = shiftKey === e.shiftKey;

        if (isKeyMatch && isCtrlMatch && isShiftMatch) {
          e.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
