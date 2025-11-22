import { GoogleGenAI, Type } from "@google/genai";
import { BodyMeasurements } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const analyzeBodyMeasurements = async (base64Image: string): Promise<BodyMeasurements> => {
  // Remove header if present (data:image/jpeg;base64,)
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  const prompt = `
    Analyze the person in this image for tailoring purposes. 
    Based on standard anthropometric ratios and the visible proportions of the person, estimate the following body measurements.
    
    Assume an average adult height if exact reference is missing, or deduce from background cues if possible.
    Provide realistic estimates for a tailor.
    
    Return the result in JSON format with numeric values in centimeters (cm).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            neck: { type: Type.NUMBER, description: "Neck circumference in cm" },
            shoulders: { type: Type.NUMBER, description: "Shoulder width in cm" },
            chest: { type: Type.NUMBER, description: "Chest circumference in cm" },
            waist: { type: Type.NUMBER, description: "Waist circumference in cm" },
            hips: { type: Type.NUMBER, description: "Hip circumference in cm" },
            sleeve: { type: Type.NUMBER, description: "Sleeve length in cm" },
            inseam: { type: Type.NUMBER, description: "Inseam length in cm" },
            heightEstimate: { type: Type.NUMBER, description: "Estimated total height in cm" },
          },
          required: ["neck", "shoulders", "chest", "waist", "hips", "sleeve", "inseam", "heightEstimate"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(text);
    return {
      ...data,
      unit: 'cm'
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};