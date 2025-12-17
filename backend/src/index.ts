import express from 'express';
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
	throw new Error("GEMINI_API_KEY is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();
const port = 3000;

app.get('/api/events', async (req, res) => {
	try {
		const prompt = decodeURIComponent(req.query.prompt as string);
		const formatting = 'For each event, provide the start date, end date (if applicable), a label and a short description. Format the response as a JSON array.';
		const response = await ai.models.generateContent({
			model: "gemma-3-27b-it",
			contents: `${prompt} ${formatting}`,
		});
		const text = response.text || '[]';
		const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
		res.json(JSON.parse(cleanText));
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});