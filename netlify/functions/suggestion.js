import { GoogleGenAI } from "@google/genai";

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error: API key not configured" }),
    };
  }

  try {
    const { idea } = JSON.parse(event.body);

    if (!idea) {
      return { statusCode: 400, body: JSON.stringify({ error: "Idea is required" }) };
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are Athena, a creative AI assistant helping with brainstorming ideas. A user has this idea: "${idea}"

Provide a very short, concise suggestion to improve or expand on this idea. Keep your response to 1-2 sentences maximum. Be creative, innovative, and helpful.

Suggestion:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    });

    const text = response.text;

    return {
      statusCode: 200,
      body: JSON.stringify({ suggestion: text ? text.trim() : "No suggestion generated" }),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate suggestion. Please try again." }),
    };
  }
};
