import { openai } from './config';
import { SYSTEM_PROMPTS } from './config';
import { AIResponse } from './types';

export async function getGeneralResponse(
  prompt: string,
  onChunk?: (chunk: string) => void
): Promise<AIResponse> {
  if (!openai) {
    return {
      explanation: "OpenAI API key is not configured. Please add your API key to the .env file."
    };
  }

  try {
    const stream = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPTS.general
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4o",
      temperature: 0.7,
      stream: true
    });

    let fullResponse = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
      
      if (onChunk && content) {
        onChunk(content);
      }
    }

    return {
      explanation: fullResponse || "I apologize, but I couldn't generate a response."
    };
  } catch (error) {
    console.error('Error getting response:', error);
    return {
      explanation: "I apologize, but I'm currently unable to assist. Please ensure your API key is valid and try again."
    };
  }
}