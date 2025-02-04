import React, { useState, useRef, useEffect } from 'react';
import { Keyboard, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Shortcut {
  description: string;
  keys: string[];
}

const SHORTCUTS: Shortcut[] = [
  { description: 'Open Folder', keys: ['Ctrl', 'O'] },
  { description: 'Save', keys: ['Ctrl', 'S'] },
  { description: 'Undo', keys: ['Ctrl', 'Z'] },
  { description: 'Redo', keys: ['Ctrl', 'Shift', 'Z'] },
  { description: 'Select All', keys: ['Ctrl', 'A'] },
  { description: 'Scrolling (Vertical)', keys: ['Ctrl', 'Scroll'] },
  { description: 'Scrolling (Horizontal)', keys: ['Ctrl', 'Shift', 'Scroll'] },
  { description: 'Direct Editing', keys: ['E'] },
  { description: 'Hand Tool', keys: ['H'] },
  { description: 'Lasso Tool', keys: ['L'] },
  { description: 'Space Tool', keys: ['S'] },
  { description: 'Replace Tool', keys: ['R'] },
  { description: 'Append anything', keys: ['A'] },
];

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md",
          "text-sm font-medium text-gray-700",
          "hover:bg-gray-100 transition-colors",
          isOpen && "bg-gray-100"
        )}
        title="Keyboard shortcuts"
      >
        <Keyboard className="w-4 h-4" />
        Shortcuts
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform duration-200",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="space-y-1">
              {SHORTCUTS.map((shortcut, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-2 text-sm rounded-md",
                    "hover:bg-gray-50 transition-colors"
                  )}
                >
                  <span className="text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {shortcut.keys.map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-gray-400">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}