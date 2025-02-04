import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Import, Sparkle, User, Copy, Check, Code, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isAi: boolean;
  timestamp: Date;
  xml?: string;
  onImport?: (xml: string) => void;
  isStreaming?: boolean;
}

export function ChatMessage({ 
  message, 
  isAi, 
  timestamp, 
  xml, 
  onImport,
  isStreaming 
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showXml, setShowXml] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg group relative",
        isAi ? "bg-gradient-to-r from-blue-50 to-blue-100" : "bg-gray-50"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isAi ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600" : "bg-gray-200 text-gray-600"
      )}>
        {isAi ? <Sparkle className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium text-sm",
            isAi ? "text-blue-700" : "text-gray-700"
          )}>
            {isAi ? 'Eirene' : 'You'}
          </span>
          <span className="text-xs text-gray-400">
            {timestamp.toLocaleTimeString()}
          </span>
          {isStreaming && (
            <span className="text-xs text-blue-500 animate-pulse">typing...</span>
          )}
        </div>
        <div className={cn(
          "mt-1 text-sm break-words",
          isAi ? "text-blue-900" : "text-gray-900"
        )}>
          <div className="whitespace-pre-wrap overflow-x-auto">
            {message}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-500 animate-pulse" />
            )}
          </div>
        </div>
        {xml && !isStreaming && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onImport?.(xml)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <Import className="w-4 h-4" />
                Import to Canvas
              </button>
              <button
                onClick={() => setShowXml(!showXml)}
                className="flex items-center gap-1.5 px-2 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Code className="w-3 h-3" />
                {showXml ? 'Hide' : 'View'} XML
                {showXml ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
            {showXml && (
              <div className="relative">
                <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm max-w-full">
                  <code className="block whitespace-pre-wrap break-all">
                    {xml}
                  </code>
                </pre>
                <button
                  onClick={() => handleCopy(xml)}
                  className={cn(
                    "absolute top-2 right-2 p-1.5 rounded-md",
                    "text-gray-400 hover:text-gray-200 transition-colors",
                    copied && "text-green-400"
                  )}
                  title={copied ? "Copied!" : "Copy XML"}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {!isStreaming && message && (
        <button
          onClick={() => handleCopy(message)}
          className={cn(
            "absolute top-4 right-4 p-1.5 rounded-md",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-white/50",
            copied ? "text-green-500" : "text-gray-500"
          )}
          title={copied ? "Copied!" : "Copy message"}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}