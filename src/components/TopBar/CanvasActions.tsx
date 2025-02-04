import React from 'react';
import { Eraser } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CanvasActionsProps {
  onClear: () => void;
  disabled?: boolean;
}

export function CanvasActions({ onClear, disabled }: CanvasActionsProps) {
  const buttonClass = cn(
    "flex items-center gap-1.5 px-3 py-1.5 rounded-md",
    "text-sm font-medium text-gray-700",
    !disabled && "hover:bg-gray-100 transition-colors",
    disabled && "opacity-50 cursor-not-allowed"
  );

  return (
    <button
      onClick={onClear}
      className={buttonClass}
      title="Clear canvas"
      disabled={disabled}
    >
      <Eraser className="w-4 h-4" />
      Clear
    </button>
  );
}