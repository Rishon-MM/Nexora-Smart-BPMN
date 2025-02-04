import { useState, useCallback } from 'react';

interface UseVoiceInputProps {
  onInterimResult?: (transcript: string) => void;
  onFinalResult: (transcript: string) => void;
  onError?: (error: string) => void;
}
// voice input
export function useVoiceInput({ onInterimResult, onFinalResult, onError }: UseVoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      onError?.('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      
      if (result.isFinal) {
        onFinalResult(transcript);
      } else {
        onInterimResult?.(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      onError?.(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognition);
    recognition.start();
  }, [onInterimResult, onFinalResult, onError]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return {
    isListening,
    startListening,
    stopListening
  };
}