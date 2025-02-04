import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ExportMenu } from './ExportMenu';
import type { ExportFormat } from '../../utils/exportUtils';

interface FileActionsProps {
  onImport: (xml: string) => void;
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
}

export function FileActions({ onImport, onExport, disabled }: FileActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onImport(content);
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Failed to read the file. Please try again.');
      }
    }
  };

  const buttonClass = cn(
    "flex items-center gap-1.5 px-3 py-1.5 rounded-md",
    "text-sm font-medium",
    !disabled && "hover:bg-gray-100 transition-colors",
    disabled && "opacity-50 cursor-not-allowed"
  );

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".bpmn,.xml"
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className={buttonClass}
        title="Import BPMN file"
        disabled={disabled}
      >
        <Upload className="w-4 h-4" />
        Import
      </button>
      <ExportMenu onExport={onExport} disabled={disabled} />
    </div>
  );
}