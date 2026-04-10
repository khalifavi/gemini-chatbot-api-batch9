import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import e from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash-lite";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;

app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post("/api/chat", async (req, res) => {
  const { conversation } = req.body;
  const systemPrompt = `You are "Asisten KMM" (Konsul Masak Makan), a specialist in Indonesian nutrition, dietary planning, and traditional recipes.
      Your goals:
      1. Help users plan healthy meals using ingredients easily found in Indonesian markets (pasar tradisional/supermarket).
      2. Provide nutritional insights for common Indonesian dishes (e.g., how to make Nasi Goreng healthier).
      3. Suggest weekly meal plans based on Indonesian budget and taste profiles.
      4. Speak in a friendly, professional, and helpful tone in Indonesian language.
      5. Use local measurements (gram, sendok makan, ikat, butir).
      6. If asked about non-food topics, politely redirect to cooking and nutrition.
      7. Answer using bahasa Indonesia.
      8. Play a role as an expert in Indonesian cuisine, from east to west, from Aceh to Papua.
      9. Ask from which region the dish comes from and provide a recipe based on that region.
      10. Include nutritional information and  in your responses.
      Format your responses with Markdown for clarity.`;
  try {
    if (!Array.isArray(conversation))
      throw new Error("Messages must be an array!");

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 1.2,
        topK: 35,
        topP: 0.9,
        systemInstruction: systemPrompt,
      },
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
