
import { GoogleGenAI, Type } from "@google/genai";

// Helper to safely access environment variables
const getApiKey = () => {
  try {
    // @ts-ignore
    return (typeof process !== 'undefined' && process.env?.API_KEY) || '';
  } catch {
    return '';
  }
};

/**
 * Lazy initialization of the AI client to ensure it doesn't crash 
 * if process.env is not yet available during the module load.
 */
let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return aiInstance;
};

/**
 * Generates a formal society notice based on a provided topic using Gemini 3 Flash.
 */
export const generateSocietyNotice = async (topic: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a formal society notice about: ${topic}. Include Date, Subject, and a professional message. Return as clean Markdown.`,
  });
  return response.text;
};

/**
 * Analyzes society security logs and provides a professional summary.
 */
export const analyzeSecurityLog = async (logs: any) => {
  const ai = getAI();
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
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a resident in flat ${flat}. A visitor named ${visitorName} is at the gate for: "${purpose}". 
    Decide if you want to let them in. 
    Be realistic: Approve standard deliveries and guests, but be skeptical of vague or suspicious purposes.`,
    config: { 
      responseMimeType: "application/json",
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
