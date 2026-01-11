
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Gemini acts as the 'Smart Dispatcher'. 
 * It takes raw guard input and turns it into a professional notification for the resident.
 */
export const composeResidentAlert = async (visitorName: string, purpose: string, residentName: string, flat: string) => {
  // Create a new instance right before making the API call as per SDK guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a very short, professional WhatsApp notification for a resident.
      Resident: ${residentName} (Flat ${flat})
      Visitor: ${visitorName}
      Guard's Purpose Input: "${purpose}"
      
      The message should be polite and urgent. Include the visitor name and a clarified purpose.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING, description: "The drafted WhatsApp message text." },
            urgency: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
          },
          required: ["message", "urgency"]
        }
      }
    });
    
    // .text is a property, not a method
    return JSON.parse(response.text || '{}').message;
  } catch (err) {
    console.error("Gemini Error:", err);
    return `GateBuddy Alert: ${visitorName} is at the gate for ${purpose}. Please respond.`;
  }
};

/**
 * Simulates the resident's decision logic if they don't respond within 30 seconds.
 */
export const simulateResidentResponse = async (visitorName: string, purpose: string, flat: string) => {
  // Create a new instance right before making the API call as per SDK guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a resident in flat ${flat}. Visitor: ${visitorName}, Purpose: ${purpose}. Decide if you want to let them in.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            approved: { type: Type.BOOLEAN },
            message: { type: Type.STRING }
          },
          required: ["approved", "message"]
        }
      }
    });
    // .text is a property, not a method
    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error("Gemini Error:", err);
    return { approved: true, message: "Auto-approved by system." };
  }
};

/**
 * Generates a professional notice for the society notice board based on a provided topic.
 */
export const generateSocietyNotice = async (topic: string) => {
  // Create a new instance right before making the API call as per SDK guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a professional, clear, and polite notice for a residential society notice board.
      Topic: "${topic}"
      The notice should include a heading and a body. Use a formal tone.`,
    });
    
    // .text is a property, not a method
    return response.text;
  } catch (err) {
    console.error("Gemini Error:", err);
    return `Important Notice regarding: ${topic}. Please check with the society office for more details.`;
  }
};
