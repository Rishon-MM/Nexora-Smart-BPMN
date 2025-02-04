import React, { forwardRef, useImperativeHandle } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
  onInterimChange: (interim: string) => void;
  disabled?: boolean;
}

export const VoiceInput = forwardRef<{ stopListening: () => void }, VoiceInputProps>(({
  onTranscriptChange,
  onInterimChange,
  disabled,
}, ref) => {
  const {
    isListening,
    error,
    startListening,
    stopListening,
  } = useVoiceRecognition({
    onTranscriptChange,
    onInterimChange,
  });

  useImperativeHandle(ref, () => ({
    stopListening
  }));

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (error) {
    console.error('Voice input error:', error);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "p-2 rounded-lg transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        isListening ? (
          "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
        ) : (
          "bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500"
        ),
        disabled && "opacity-50 cursor-not-allowed"
      )}
      title={isListening ? "Click to stop recording" : "Click to start recording"}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
});