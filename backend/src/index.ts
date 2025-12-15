import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
	throw new Error("GEMINI_API_KEY is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
	const query = 'List 10 most important events in British history.';
	const formatting = 'For each event, provide the start date, end date (if applicable), a label and a short description. Format the response as a JSON array.';
	const response = await ai.models.generateContent({
		model: "gemma-3-27b-it",
		contents: `${query} ${formatting}`,
	});
	console.log(response.text);
}

main();