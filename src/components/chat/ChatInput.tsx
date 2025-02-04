import React, { useState, useCallback, useRef } from 'react';
import { Send, Image as ImageIcon, PenTool, Pencil, PencilLine } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { MessageInput } from './MessageInput';
import { ImageInput } from './ImageInput';
import { DrawingCanvas } from '../drawing/DrawingCanvas';
import { cn } from '../../utils/cn';
import { analyzeBPMNImage } from '../../services/ai/imageAnalysis';
import { enhancePrompt } from '../../services/ai/promptEnhancement';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  allowEnhance?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled, allowEnhance }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageInput, setShowImageInput] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const voiceInputRef = useRef<{ stopListening: () => void }>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !isAnalyzing) {
      voiceInputRef.current?.stopListening();
      onSendMessage(message.trim());
      setMessage('');
      setInterimTranscript('');
      setSelectedImage(null);
      setShowImageInput(false);
    }
  };

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setMessage(prev => {
      const newMessage = prev.trim() ? `${prev.trim()} ${transcript}` : transcript;
      return newMessage;
    });
  }, []);

  const handleInterimTranscript = useCallback((interim: string) => {
    setInterimTranscript(interim);
  }, []);

  const handleImageSelect = useCallback(async (file: File) => {
    try {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setIsAnalyzing(true);
      
      const analysis = await analyzeBPMNImage(file);
      setMessage(analysis.explanation);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to analyze the BPMN image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleClearImage = useCallback(() => {
    setSelectedImage(null);
    setShowImageInput(false);
  }, []);

  const handleDrawingAnalysis = (analysis: string) => {
    setMessage(analysis);
  };

  const handleEnhancePrompt = async () => {
    if (!message.trim() || isEnhancing || !allowEnhance) return;

    try {
      setIsEnhancing(true);
      const enhancedPrompt = await enhancePrompt(message);
      setMessage(enhancedPrompt);
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      alert('Failed to enhance the prompt. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex flex-col gap-2">
        {showImageInput && (
          <ImageInput
            onImageSelect={handleImageSelect}
            disabled={isLoading || isAnalyzing}
            selectedImage={selectedImage}
            onClearImage={handleClearImage}
          />
        )}
        {interimTranscript && (
          <div className="text-sm text-blue-500 italic px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
            {interimTranscript}...
          </div>
        )}
        <div className="flex gap-2 items-end">
          {/* Main input area */}
          <div className="flex-1">
            <MessageInput
              value={message}
              onChange={setMessage}
              disabled={isLoading || disabled}
              isInterim={!!interimTranscript}
              isAnalyzing={isAnalyzing}
              onEnhancePrompt={allowEnhance ? handleEnhancePrompt : undefined}
              isEnhancing={isEnhancing}
            />
          </div>

          {/* Vertical buttons */}
          <div className="flex flex-col justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowDrawingCanvas(true)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500",
                (isLoading || isAnalyzing || disabled) && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading || isAnalyzing || disabled}
              title="Draw BPMN diagram"
            >
              <PencilLine className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                showImageInput
                  ? "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500",
                (isLoading || isAnalyzing || disabled) && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading || isAnalyzing || disabled}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <VoiceInput
              ref={voiceInputRef}
              onTranscriptChange={handleVoiceTranscript}
              onInterimChange={handleInterimTranscript}
              disabled={isLoading || isAnalyzing || disabled}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim() || isAnalyzing || disabled}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "bg-blue-500 text-white",
                "hover:bg-blue-600 hover:shadow-md",
                "disabled:bg-blue-300 disabled:cursor-not-allowed disabled:shadow-none",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <DrawingCanvas
        isOpen={showDrawingCanvas}
        onClose={() => setShowDrawingCanvas(false)}
        onAnalysisComplete={handleDrawingAnalysis}
      />
    </form>
  );
}