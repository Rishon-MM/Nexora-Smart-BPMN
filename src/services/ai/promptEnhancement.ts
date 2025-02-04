import { openai } from './config';

export async function enhancePrompt(prompt: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at improving BPMN process descriptions. Your task is to enhance the given prompt to be more detailed and specific, focusing on:
            1. Enhance the following BPMN process by making it more detailed and specific.
            2. Ensure the process flow is clearly defined from start to finish.
            3. if requires mention event, task types like manualtask, service task, timer event, etc.. 
            4. Keep the enhanced prompt concise but comprehensive.
            6. Do not include any explanations or meta-commentary.
            7. only respond if user realated input has BPMN or process , else gently request again. 
            8. Return only the enhanced prompt start with user statement.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens:500,
    });

    return response.choices[0]?.message?.content || prompt;
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    throw new Error('Failed to enhance the prompt');
  }
}