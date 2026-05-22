import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const { history } = req.body;
    const contents = history
      .filter((msg: any) => msg.role !== 'system')
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction:
          'You are Yandasm, a supportive student wellness companion. Provide empathetic, non-judgmental, and practical guidance for academic stress, anxiety, and personal well-being. Always include a disclaimer for serious mental health crises to seek professional human help or emergency services.',
        temperature: 0.7,
      },
    });

    res.json({ content: response.text });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'AI generation failed' });
  }
}
