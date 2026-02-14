import { GoogleGenAI } from "@google/genai";
import { ImageGenerationOptions } from "../types";

// Helper to check for the paid key requirement
export const checkAndRequestApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
       return false;
    }
    return true;
  }
  // Fallback if not running in the specific environment that supports this
  // In a real app, you might prompt for a key manually, but per instructions we assume the environment helpers exist or we use process.env
  return !!process.env.API_KEY; 
};

export const promptForApiKey = async (): Promise<void> => {
    if(window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
    }
}

export const generateImage = async (options: ImageGenerationOptions): Promise<string> => {
  // Always create a new instance to ensure we pick up the selected key if it changed
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: options.prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: options.aspectRatio,
          imageSize: options.size,
        },
      },
    });

    // Parse response
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64EncodeString = part.inlineData.data;
          // The mimeType usually comes back as image/png or image/jpeg
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64EncodeString}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error: any) {
    console.error("Gemini Image Generation Error:", error);
    // Detect the specific "Requested entity was not found" error which implies API key issues in the Veo/Pro workflow
    if (error.message && error.message.includes("Requested entity was not found")) {
        // We re-throw a specific error so the UI can prompt for key re-selection
        throw new Error("API_KEY_INVALID");
    }
    throw new Error(error.message || "Failed to generate image");
  }
};