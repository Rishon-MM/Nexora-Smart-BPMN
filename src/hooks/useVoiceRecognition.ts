import { useState, useCallback, useRef, useEffect } from 'react';

interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

interface UseVoiceRecognitionProps {
  onTranscriptChange: (transcript: string) => void;
  onInterimChange: (interim: string) => void;
}

export function useVoiceRecognition({ onTranscriptChange, onInterimChange }: UseVoiceRecognitionProps) {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  const recognitionRef = useRef<any>(null);

  // Cleanup function to handle component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setState(prev => ({ ...prev, error: 'Speech recognition is not supported in this browser.' }));
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState(prev => ({ 
        ...prev, 
        isListening: true, 
        error: null,
        interimTranscript: '' // Clear interim transcript when starting
      }));
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onTranscriptChange(finalTranscript);
      }
      if (interimTranscript) {
        onInterimChange(interimTranscript);
      }

      setState(prev => ({
        ...prev,
        transcript: finalTranscript,
        interimTranscript,
      }));
    };

    recognition.onerror = (event: any) => {
      setState(prev => ({
        ...prev,
        error: event.error,
        isListening: false,
        interimTranscript: '' // Clear interim transcript on error
      }));
      onInterimChange(''); // Notify parent about cleared interim transcript
    };

    recognition.onend = () => {
      setState(prev => ({ 
        ...prev, 
        isListening: false,
        interimTranscript: '' // Clear interim transcript when stopping
      }));
      onInterimChange(''); // Notify parent about cleared interim transcript
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscriptChange, onInterimChange]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setState(prev => ({ 
        ...prev, 
        isListening: false,
        interimTranscript: '' // Clear interim transcript when manually stopping
      }));
      onInterimChange(''); // Notify parent about cleared interim transcript
    }
  }, [onInterimChange]);

  return {
    ...state,
    startListening,
    stopListening,
  };
}