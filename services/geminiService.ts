
import { FaceDetection } from "../types";

export class GeminiService {
  constructor() {
    // No initialization here
  }

  async detectFaces(base64Image: string): Promise<FaceDetection[]> {
    try {
      const response = await fetch("/api/detect-faces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore durante la rilevazione dei volti");
      }

      return await response.json();
    } catch (error) {
      console.error("Face Detection Error:", error);
      return [];
    }
  }

  async retouchImage(base64Image: string, prompt: string, model: string = 'gemini-2.5-flash-image'): Promise<string> {
    try {
      const response = await fetch("/api/retouch-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64Image, prompt, model }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore durante il fotoritocco");
      }

      const data = await response.json();
      return data.image;
    } catch (error) {
      console.error("Gemini Retouching Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
