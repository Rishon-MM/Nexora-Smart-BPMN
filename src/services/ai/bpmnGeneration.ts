import { openai } from './config';
import { SYSTEM_PROMPTS } from './config';
import { BPMNGenerationResponse } from './types';

// Helper function to parse the AI response
function parseResponse(response: string): [string, string] {
  const explanationMatch = response.match(/\[EXPLANATION\]([\s\S]*?)(?=\[BPMN\])/);
  const xmlMatch = response.match(/\[BPMN\]([\s\S]*$)/);

  const explanation = explanationMatch ? explanationMatch[1].trim() : "";
  const xml = xmlMatch ? xmlMatch[1].trim() : "";

  return [explanation, xml];
}

// Helper function to validate connections in the BPMN XML
function validateConnections(xml: string): boolean {
  const sequenceFlowRegex = /<bpmn2:sequenceFlow[\s\S]*?\/>/g;
  const sourceRefRegex = /sourceRef="(.*?)"/g;
  const targetRefRegex = /targetRef="(.*?)"/g;

  const sequenceFlows = xml.match(sequenceFlowRegex) || [];
  for (const flow of sequenceFlows) {
    const sourceRef = sourceRefRegex.exec(flow)?.[1];
    const targetRef = targetRefRegex.exec(flow)?.[1];
    if (!sourceRef || !targetRef) {
      return false; // Invalid flow detected
    }
  }
  return true; // All connections are valid
}

// Helper function to add default connections if missing
function addDefaultConnections(xml: string): string {
  const tasks = [...xml.matchAll(/<bpmn2:task id="(.*?)"/g)];
  const startEvent = xml.match(/<bpmn2:startEvent id="(.*?)"/)?.[1];
  const endEvent = xml.match(/<bpmn2:endEvent id="(.*?)"/)?.[1];

  let sequenceFlows = '';
  if (startEvent && tasks.length) {
    sequenceFlows += `<bpmn2:sequenceFlow id="Flow_start" sourceRef="${startEvent}" targetRef="${tasks[0][1]}" />\n`;
  }
  tasks.forEach((task, index) => {
    if (tasks[index + 1]) {
      sequenceFlows += `<bpmn2:sequenceFlow id="Flow_${index}" sourceRef="${task[1]}" targetRef="${tasks[index + 1][1]}" />\n`;
    }
  });
  if (endEvent && tasks.length) {
    sequenceFlows += `<bpmn2:sequenceFlow id="Flow_end" sourceRef="${tasks[tasks.length - 1][1]}" targetRef="${endEvent}" />\n`;
  }
  return xml.replace(/<\/bpmn2:process>/, `${sequenceFlows}</bpmn2:process>`);
}

// Main function to generate BPMN
export async function generateBPMN(
  prompt: string,
  onChunk?: (chunk: string) => void
): Promise<BPMNGenerationResponse> {
  if (!openai) {
    return {
      explanation: "OpenAI API key is not configured. Please add your API key to the .env file.",
      xml: ""
    };
  }

  try {
    const stream = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPTS.bpmnGeneration
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4o",
      temperature: 0.3,
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

    const [explanation, xml] = parseResponse(fullResponse);

    // Ensure connections are valid
    let processedXml = xml;
    if (!validateConnections(processedXml)) {
      processedXml = addDefaultConnections(processedXml);
    }

    return {
      explanation,
      xml: processedXml || "No BPMN diagram was generated. Please try again with a more detailed process description."
    };
  } catch (error) {
    console.error('Error generating BPMN:', error);
    return {
      explanation: "I apologize, but I'm currently unable to assist. Please ensure your API key is valid and try again.",
      xml: ""
    };
  }
}