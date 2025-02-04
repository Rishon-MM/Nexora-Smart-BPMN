import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ImageInputProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
  selectedImage?: string | null;
  onClearImage?: () => void;
}

export function ImageInput({ onImageSelect, disabled, selectedImage, onClearImage }: ImageInputProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    disabled,
    maxFiles: 1
  });

  return (
    <div className="relative">
      {selectedImage ? (
        <div className="relative group">
          <img
            src={selectedImage}
            alt="Selected BPMN"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={onClearImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Drop the image here"
              : "Drag & drop a BPMN image, or click to select"}
          </p>
        </div>
      )}
    </div>
  );
}