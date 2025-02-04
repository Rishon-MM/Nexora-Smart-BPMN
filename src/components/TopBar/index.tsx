import React from 'react';
import { FileActions } from './FileActions';
import { CanvasActions } from './CanvasActions';
import { ShortcutsHelp } from './ShortcutsHelp';
import { Save } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { ExportFormat } from '../../utils/exportUtils';

interface TopBarProps {
  onSave: () => void;
  onImport: (xml: string) => void;
  onExport: (format: ExportFormat) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function TopBar({ onSave, onImport, onExport, onClear, disabled }: TopBarProps) {
  return (
    <div className="bg-white border-b shadow-sm px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">NEXORA</h1>
          <div className="h-6 w-px bg-gray-200" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md",
              "text-sm font-medium",
              !disabled && "hover:bg-gray-100 transition-colors",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            title="Save diagram"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <FileActions 
            onImport={onImport} 
            onExport={onExport}
            disabled={disabled}
          />
          <div className="h-6 w-px bg-gray-200" />
          <CanvasActions 
            onClear={onClear}
            disabled={disabled}
          />
          <div className="h-6 w-px bg-gray-200" />
          <ShortcutsHelp />
        </div>
      </div>
    </div>
  );
}