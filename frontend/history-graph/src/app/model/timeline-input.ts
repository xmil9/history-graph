import * as z from "zod";
import { Timeline } from "./timeline";
import { HEvent } from "./historic-event";
import { HDate, HPeriod } from "./historic-date";

const EventInputSchema = z.object({
	label: z.string(),
	start_date: z.string(),
	end_date: z.string().optional(),
	description: z.string().optional()
});
type EventInput = z.infer<typeof EventInputSchema>;

const TimelineInputSchema = z.object({
	title: z.string(),
	start_date: z.string(),
	end_date: z.string(),
	events: z.array(EventInputSchema)	
});

export function parseTimeline(timelineInput: any): Timeline {
	const tl = TimelineInputSchema.parse(timelineInput);
	return new Timeline(
		tl.title,
		parsePeriod(tl.start_date, tl.end_date),
		parseEvents(tl.events)
	);
}

function parseEvents(events: EventInput[]): HEvent[] {
	return events.map((event: EventInput) => {
		try
		{
			const startDate = parseDate(event.start_date);
			const endDate = event.end_date ? parseDate(event.end_date) : undefined;
			const isPeriod = endDate && !endDate.equals(startDate);
			
			if (isPeriod) {
				return new HEvent(
					new HPeriod(startDate, endDate),
					event.label,
					event.description
				);
			}

			return new HEvent(
				startDate,
				event.label,
				event.description
			);
		}
		catch (error) {
			console.error('Failed to parse event:', event.label, 'Error:', error, " -- Skipped");
			return undefined;
		}
	}).filter((event: HEvent | undefined) => event !== undefined);
}

function parsePeriod(startDate: string, endDate: string): HPeriod {
	return new HPeriod(parseDate(startDate), parseDate(endDate));
}

function parseDate(date: string): HDate {
	let BC = false;
	let dateAD = date;
	if (date.startsWith('-')) {
		BC = true;
		dateAD = date.substring(1);
	}
	const [yearAD, month, day] = dateAD.split('-');
	return new HDate(parseInt(BC ? `-${yearAD}` : yearAD), month ? parseInt(month) : undefined, day ? parseInt(day) : undefined);
}
