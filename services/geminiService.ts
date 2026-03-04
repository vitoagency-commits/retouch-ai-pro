
import { GoogleGenAI, Type } from "@google/genai";
import { FaceDetection } from "../types";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getAI() {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY non configurata");
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  async detectFaces(base64Image: string): Promise<FaceDetection[]> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: 'Identify all faces in this image. For each face, provide the bounding box and exact pixel coordinates for: leftEye, rightEye, noseBridge, mouthLeft, mouthRight, and chin. Return the results in a precise JSON array.',
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                boundingBox: {
                  type: Type.OBJECT,
                  properties: {
                    min: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ['x', 'y'] },
                    max: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ['x', 'y'] },
                  },
                  required: ['min', 'max']
                },
                landmarks: {
                  type: Type.OBJECT,
                  properties: {
                    leftEye: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ['x', 'y'] },
                    rightEye: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ['x', 'y'] },
                    noseBridge: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ['x', 'y'] },
                    mouthLeft: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ['x', 'y'] },
                    mouthRight: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ['x', 'y'] },
                    chin: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ['x', 'y'] },
                  },
                  required: ['leftEye', 'rightEye', 'noseBridge', 'mouthLeft', 'mouthRight', 'chin']
                }
              },
              required: ['boundingBox', 'landmarks']
            }
          }
        }
      });

      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Face Detection Error:", error);
      return [];
    }
  }

  async retouchImage(base64Image: string, prompt: string, model: string = 'gemini-2.5-flash-image'): Promise<string> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      for (const candidate of response.candidates || []) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error("Nessuna immagine restituita dall'AI.");
    } catch (error) {
      console.error("Gemini Retouching Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
