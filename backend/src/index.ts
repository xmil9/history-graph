import express from 'express';
import { GoogleGenAI } from "@google/genai";
import cors from 'cors';

const port = 3000;

if (!process.env.GEMINI_API_KEY) {
	throw new Error("GEMINI_API_KEY is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();
// Disable CORS.
app.use(cors());

app.get('/api/generate-timeline', async (req, res) => {
	try {
		const prompt = decodeURIComponent(req.query.prompt as string);
		console.debug("Prompt: ", prompt);

		const formatting = 'Format the response as a JSON object. The JSON object should have title for the query, a start and and end date for the covered time period, and an array of events. The events should be in the format of a JSON array of objects. For each event, provide the start date, end date (if applicable), a label and a short description. The dates should be in the format YYYY-MM-DD if the day is known, in the format YYYY-MM if the month is known, or YYYY if the year is known. Years with less than 4 digits should *not* be padded with zeros. For historic date use a negative year number for BC. Sort the events in chronological order. Do not include any other text in the response.';

		const response = await ai.models.generateContent({
			model: "gemma-3-27b-it",
			contents: `${prompt} ${formatting}`,
		});
		console.debug("Response: ", response.text);

		res.json(formatResponse(response.text));
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

function formatResponse(response: string | undefined): any {
	if (!response) {
		throw new Error("Response is undefined");
	}
	return JSON.parse(response.replace(/```json/g, '').replace(/```/g, '').trim());
}