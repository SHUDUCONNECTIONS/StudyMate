import { GoogleGenAI } from "@google/genai";

import { Message } from "../types";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function generateWellnessResponse(history: Message[]) {
  try {
    const response = await fetch("/api/ai/wellness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history }),
    });

    if (!response.ok) throw new Error("AI request failed");
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
