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
	const input = TimelineInputSchema.parse(timelineInput);
	const tl = new Timeline(
		input.title,
		parsePeriod(input.start_date, input.end_date),
		parseEvents(input.events)
	);
	return validateTimeline(tl);
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
			console.error('Failed to parse event:', event.label, 'Error:', error, " -- Skipping event");
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

function validateTimeline(tl: Timeline): Timeline {
	return validatePeriod(tl);
}

function validatePeriod(tl: Timeline): Timeline {
	let hasChanged = false;
	let firstDate = tl.period.from;
	let lastDate = tl.period.to;

	for (const event of tl.events) {
		if (event.when.less(firstDate)) {
			firstDate = event.when;
			hasChanged = true;
		}
		if (event.when.greater(lastDate)) {
			lastDate = event.when;
			hasChanged = true;
		}
		if (event.until && event.until.greater(lastDate)) {
			lastDate = event.until;
			hasChanged = true;
		}
	}
	
	if (hasChanged)
		return new Timeline(tl.title, new HPeriod(firstDate, lastDate), tl.events);
	return tl;
}
