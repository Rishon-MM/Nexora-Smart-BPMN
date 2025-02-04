import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isInterim?: boolean;
  placeholder?: string;
  isAnalyzing?: boolean;
  onEnhancePrompt?: () => void;
  isEnhancing?: boolean;
}

export function MessageInput({
  value,
  onChange,
  disabled,
  isInterim,
  isAnalyzing,
  placeholder = 'Type your message here...',
  onEnhancePrompt,
  isEnhancing,
}: MessageInputProps) {
  return (
    <div className="relative flex-1">
      {isAnalyzing && (
        <div className="absolute inset-0 bg-blue-50 rounded-lg flex items-center justify-center z-10">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-blue-600">Analyzing image...</span>
          </div>
        </div>
      )}
      <div className="relative">
        {/* Enhance Button */}
        {onEnhancePrompt && (
          <button
            onClick={onEnhancePrompt}
            disabled={disabled || isEnhancing || !value.trim()}
            className={cn(
              "absolute right-1 top-1 p-1 px-1 py-1 rounded-md transition-colors z-10",
              "text-blue-500 hover:bg-blue-50",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              (disabled || isEnhancing || !value.trim()) && "opacity-50 cursor-not-allowed"
            )}
            title="Enhance prompt with AI"
          >
            <Sparkles className={cn(
              "w-5 h-5",
              isEnhancing && "animate-spin"
            )} />
          </button>
        )}

        {/* Textarea */}
        <TextareaAutosize
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={disabled ? 'Select a project to start chatting...' : placeholder}
          minRows={4}
          maxRows={8}
          className={cn(
            "w-full px-2 py-5 text-base", // Increased left padding for enhance button
            "border rounded-lg shadow-sm",
            "bg-white text-gray-900 placeholder-gray-400",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            isInterim && "border-blue-300 bg-blue-50",
            disabled && "bg-gray-50 text-gray-500"
          )}
          disabled={disabled || isAnalyzing}
        />

        {/* Word Count */}
        {value.length > 0 && (
          <div className="absolute right-2 bottom-2 px-2 py-1 text-xs text-gray-400 bg-white/80 rounded">
            {value.length}
          </div>
        )}
      </div>
    </div>
  );
}