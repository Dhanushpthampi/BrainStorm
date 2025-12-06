import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { idea } = req.body;

    if (!idea?.title) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
I have this brainstorming idea:

Title: ${idea.title}
Description: ${idea.description || ""}

Suggest 5 short, creative, related ideas.
Return ONLY valid JSON array of strings.
    `;

    const ai = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const raw = ai.choices[0].message.content;
    const suggestions = JSON.parse(raw);

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI failed" });
  }
}
