import React, { useState, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { getGeneralResponse, generateBPMN } from '../../services/ai';
import { Sparkles, Trash2 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { cn } from '../../utils/cn';

interface Message {
  id: string;
  text: string;
  isAi: boolean;
  timestamp: Date;
  xml?: string;
  isStreaming?: boolean;
}

interface AIChatProps {
  onImportBPMN?: (xml: string) => void;
}

export function AIChat({ onImportBPMN }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedProjectId, saveChatMessage } = useProjectStore();

  // Load chat history when project changes
  useEffect(() => {
    if (selectedProjectId) {
      const loadChatHistory = async () => {
        const project = await useProjectStore.getState().loadProjectData(selectedProjectId);
        if (project?.chatHistory) {
          setMessages(project.chatHistory);
        } else {
          setMessages([]);
        }
      };
      loadChatHistory();
    } else {
      setMessages([]);
    }
  }, [selectedProjectId]);

  const handleSendMessage = async (message: string) => {
    if (!selectedProjectId) {
      alert('Please select a project first');
      return;
    }

    const userMessageId = Date.now().toString();
    const aiMessageId = (Date.now() + 1).toString();

    // Add user message
    const userMessage = {
      id: userMessageId,
      text: message,
      isAi: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    await saveChatMessage(selectedProjectId, userMessage);

    // Add initial AI message
    setMessages(prev => [...prev, {
      id: aiMessageId,
      text: '',
      isAi: true,
      timestamp: new Date(),
      isStreaming: true
    }]);

    setIsLoading(true);

    try {
      const isBPMNRequest = /create|generate|make|build|design|draw/i.test(message) && 
                           /bpmn|diagram|process|workflow/i.test(message);

      if (isBPMNRequest) {
        const updateStreamingMessage = (chunk: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId
              ? { ...msg, text: msg.text + chunk }
              : msg
          ));
        };

        const { explanation, xml } = await generateBPMN(message, updateStreamingMessage);
        
        const aiMessage = {
          id: aiMessageId,
          text: explanation,
          isAi: true,
          timestamp: new Date(),
          xml
        };
        
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? aiMessage : msg
        ));
        
        await saveChatMessage(selectedProjectId, aiMessage);
        
        if (xml && onImportBPMN) {
          onImportBPMN(xml);
          await useProjectStore.getState().saveBpmnDiagram(selectedProjectId, xml);
        }
      } else {
        const updateStreamingMessage = (chunk: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId
              ? { ...msg, text: msg.text + chunk }
              : msg
          ));
        };

        const { explanation } = await getGeneralResponse(message, updateStreamingMessage);
        
        const aiMessage = {
          id: aiMessageId,
          text: explanation,
          isAi: true,
          timestamp: new Date()
        };
        
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? aiMessage : msg
        ));
        
        await saveChatMessage(selectedProjectId, aiMessage);
      }
    } catch (error) {
      const errorMessage = {
        id: aiMessageId,
        text: "I apologize, but I'm currently unable to process your request. Please try again.",
        isAi: true,
        timestamp: new Date()
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? errorMessage : msg
      ));
      
      await saveChatMessage(selectedProjectId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportBPMN = async (xml: string) => {
    if (selectedProjectId && onImportBPMN) {
      onImportBPMN(xml);
      await useProjectStore.getState().saveBpmnDiagram(selectedProjectId, xml);
    }
  };

  const handleClearChat = async () => {
    if (!selectedProjectId) return;
    
    if (confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
      setMessages([]);
      await useProjectStore.getState().clearChatHistory(selectedProjectId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="flex-none p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Eirene</h2>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded",
                "text-sm bg-blue-600 hover:bg-blue-700 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-400"
              )}
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-blue-100 mt-1">
          Your BPMN Process Modeling Guide
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4 px-4">
            <Sparkles className="w-12 h-12 text-blue-300" />
            <div>
              <p className="font-medium">
                {selectedProjectId ? "Start a conversation!" : "Select a project to begin"}
              </p>
              <p className="text-sm mt-1">
                I can help you with BPMN modeling and answer questions about business processes. 
                Ask me anything about BPMN or request me to create a process diagram!
              </p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isAi={message.isAi}
            timestamp={message.timestamp}
            xml={message.xml}
            onImport={handleImportBPMN}
            isStreaming={message.isStreaming}
          />
        ))}
      </div>

      <div className="flex-none border-t">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!selectedProjectId}
          allowEnhance={!!selectedProjectId}
        />
      </div>
    </div>
  );
}