import { openai } from './config';
import { AIResponse } from './types';


async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

export async function analyzeBPMNImage(imageFile: File): Promise<AIResponse> {
  if (!openai) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const base64Image = await fileToBase64(imageFile);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
       
         {
          role: "system",
          content: `You are Eirene, an advanced AI assistant specializing in BPMN (Business Process Model and Notation). Your task is to:
                1. Analyze the provided BPMN diagram image and describe the exact process flow in detail
                2. Focus on the sequence of Event type, activities, decision points, and overall process structure
                3. Only include descriptions used in image
              Response Format:
              Your explanation here..
              - Use a hierarchical structure in your response.

            Additional Information:
             -[Any additional details that could be relevant, such as Message flows, User tasks, Send task, Message task, Subprocess, DataobjectReference, DataStoreReference, Sequence flows, Pools etc.]
            
          
      
          `
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this BPMN diagram and describe the process flow and Event types in detail:${base64Image}" },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
                detail: "high"
              }
            }
          ]
        }
      ],
      temperature:0.2,
      top_p:0.9,
    });

    return {
      explanation: response.choices[0]?.message?.content || "Unable to analyze the image."
    };
  } catch (error) {
    console.error('Error analyzing BPMN image:', error);
    throw new Error('Failed to analyze the BPMN image');
  }
}