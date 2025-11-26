import { GoogleGenAI, Type } from "@google/genai";
import { AIGenerationResponse } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateSmartSettings = async (prompt: string): Promise<AIGenerationResponse | null> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert drone pilot and surveyor. 
      Based on the user's mission description, suggest optimal flight settings for a waypoint mission.
      
      User Description: "${prompt}"
      
      Return a JSON object with:
      - altitude (in meters, generally 30-120)
      - speed (in m/s, generally 2-15)
      - gimbalAngle (in degrees, usually negative, e.g., -90 for top-down, -45 for oblique)
      - explanation (short reasoning)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            altitude: { type: Type.NUMBER },
            speed: { type: Type.NUMBER },
            gimbalAngle: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
          },
          required: ["altitude", "speed", "gimbalAngle", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AIGenerationResponse;

  } catch (error) {
    console.error("Gemini AI generation failed:", error);
    return null;
  }
};