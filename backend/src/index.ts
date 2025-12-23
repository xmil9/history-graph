import express from 'express';
import { GoogleGenAI } from "@google/genai";
import cors from 'cors';

if (!process.env.GEMINI_API_KEY) {
	throw new Error("GEMINI_API_KEY is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const port = 3000;
const app = express();
// Disable CORS.
app.use(cors());

app.get('/api/generate-timeline', async (req, res) => {
	try {
		const topic = decodeURIComponent(req.query.topic as string);
		console.debug("Topic: ", topic);

		const instructions = `Generate a timeline for the topic: "${topic}". Format the response as a JSON object. The timeline should have a title for the topic, a start and and end date for the covered time period, and an array of events. The key for the title should be "title". The key for the timeline start date should be "start_date". The key for the timeline end date should be "end_date". The key for the events should be "events". The events should be in the format of a JSON array of objects. For each event, provide the start date, end date (if there is one), a label and a short description. The key for the event start date should be "start_date". The key for the event end date should be "end_date". The key for the event label should be "label". The key for the event description should be "description". The dates should be in the format YYYY-MM-DD if the day is known, in the format YYYY-MM if the month is known, or YYYY if the year is known. Years with less than 4 digits should *not* be padded with zeros. For historic dates use a negative year number for BC. The dates should always be strings. Sort the events in chronological order. Do not include any other text in the response.`;

		const response = await ai.models.generateContent({
			model: "gemma-3-27b-it",
			contents: `${instructions}`,
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