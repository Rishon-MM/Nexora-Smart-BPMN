import { useEffect, useRef } from 'react';

interface KeyboardShortcutProps {
  onSave?: () => void;
  onImport?: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts({ onSave, onImport, disabled }: KeyboardShortcutProps) {
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      const ctrlPressed = event.ctrlKey || event.metaKey;

      if (ctrlPressed) {
        switch (event.key.toLowerCase()) {
          case 's':
            event.preventDefault();
            onSave?.();
            break;
          case 'o':
            event.preventDefault();
            if (importInputRef.current) {
              importInputRef.current.click();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onImport, disabled]);

  return { importInputRef };
}