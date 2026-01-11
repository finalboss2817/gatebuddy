
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client with the API key from environment variables.
// Following @google/genai coding guidelines for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a formal society notice based on a provided topic using Gemini 3 Flash.
 */
export const generateSocietyNotice = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a formal society notice about: ${topic}. Include Date, Subject, and a professional message. Return as clean Markdown.`,
  });
  return response.text;
};

/**
 * Analyzes society security logs and provides a professional summary of trends and risks.
 * Fixed the parameter type from any[] to any to resolve property access errors in calling components (e.g., Reports.tsx).
 */
export const analyzeSecurityLog = async (logs: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these society security logs (visitors and emergencies) and provide a professional 3-paragraph summary of security trends, potential risks, and recommendations: ${JSON.stringify(logs)}`,
  });
  return response.text;
};

/**
 * Simulates a resident's response to a visitor check-in request using a structured JSON schema.
 */
export const simulateResidentResponse = async (visitorName: string, purpose: string, flat: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a resident in flat ${flat}. A visitor named ${visitorName} is at the gate for: "${purpose}". 
    Decide if you want to let them in. 
    Be realistic: Approve standard deliveries and guests, but be skeptical of vague or suspicious purposes.`,
    config: { 
      responseMimeType: "application/json",
      // Using responseSchema for deterministic JSON output as recommended in the Google GenAI SDK guidelines.
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          approved: {
            type: Type.BOOLEAN,
            description: "Whether the resident approves the entry.",
          },
          message: {
            type: Type.STRING,
            description: "A short reason for the decision.",
          },
        },
        required: ["approved", "message"],
      },
    }
  });
  
  const text = response.text;
  if (!text) {
    return { approved: true, message: "Welcome!" };
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return { approved: true, message: "Welcome!" };
  }
};
