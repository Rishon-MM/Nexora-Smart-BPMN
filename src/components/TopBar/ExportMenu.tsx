import React, { useState } from 'react';
import { Download, ChevronDown, Image, FileCode, FileImage } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { ExportFormat } from '../../utils/exportUtils';

interface ExportOption {
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const exportOptions: ExportOption[] = [
  {
    format: 'bpmn',
    label: 'BPMN File',
    icon: <FileCode className="w-4 h-4" />,
    description: 'Export as BPMN 2.0 XML file'
  },
  {
    format: 'svg',
    label: 'SVG Vector',
    icon: <Image className="w-4 h-4" />,
    description: 'Scalable vector graphics format'
  },
  {
    format: 'png',
    label: 'PNG Image',
    icon: <FileImage className="w-4 h-4" />,
    description: 'High-quality raster image'
  },
  {
    format: 'jpeg',
    label: 'JPEG Image',
    icon: <FileImage className="w-4 h-4" />,
    description: 'Compressed raster image'
  }
];

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
}

export function ExportMenu({ onExport, disabled }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    onExport(format);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md",
          "text-sm font-medium",
          !disabled && "hover:bg-gray-100 transition-colors",
          isOpen && "bg-gray-100",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        title="Export diagram"
        disabled={disabled}
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border p-2 z-20">
          <div className="space-y-1">
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                className={cn(
                  "w-full flex items-start gap-3 p-2 rounded-md",
                  "hover:bg-gray-50 transition-colors text-left"
                )}
              >
                <div className="flex-none mt-0.5 text-gray-500">
                  {option.icon}
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}