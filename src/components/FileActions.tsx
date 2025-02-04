import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { cn } from '../utils/cn';

interface FileActionsProps {
  onImport: (xml: string) => void;
  onExport: () => void;
}
// export and import Functions
export function FileActions({ onImport, onExport }: FileActionsProps) {
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
    "flex items-center gap-2 px-4 py-2 rounded-lg",
    "bg-white hover:bg-gray-50 transition-colors duration-200",
    "text-gray-700 font-medium shadow-lg"
  );

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".bpmn,.xml"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className={buttonClass}
      >
        <Upload className="w-5 h-5" />
        <span>Import</span>
      </button>
      <button
        onClick={onExport}
        className={buttonClass}
      >
        <Download className="w-5 h-5" />
        <span>Export</span>
      </button>
    </div>
  );
}