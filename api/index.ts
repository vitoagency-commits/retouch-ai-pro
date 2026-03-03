import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload size for base64 images
app.use(express.json({ limit: '50mb' }));

// API Routes
app.post("/api/detect-faces", async (req, res) => {
    try {
      const { base64Image } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });
      }

      const ai = new GoogleGenAI({ apiKey });
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

      res.json(JSON.parse(response.text || '[]'));
    } catch (error: any) {
      console.error("Face Detection Error:", error);
      res.status(500).json({ error: error.message });
    }
});

app.post("/api/retouch-image", async (req, res) => {
    try {
      const { base64Image, prompt, model = 'gemini-2.5-flash-image' } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });
      }

      const ai = new GoogleGenAI({ apiKey });
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
              text: `${prompt}. Return ONLY the edited image as a base64 encoded string if possible, or provide the visual content in the response.`,
            },
          ],
        },
      });

      for (const candidate of response.candidates || []) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            return res.json({ image: `data:image/png;base64,${part.inlineData.data}` });
          }
        }
      }

      res.status(400).json({ error: "No image was returned by the AI." });
    } catch (error: any) {
      console.error("Retouching Error:", error);
      res.status(500).json({ error: error.message });
    }
});

async function setupServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  // Only listen if not on Vercel
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

setupServer();

// Export for Vercel
export default app;
