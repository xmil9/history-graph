import { HPeriod } from "../model/historic-date";
import { Timeline } from "../model/timeline";
import { HEvent } from "../model/historic-event";

export interface TimelineTheme {
	primaryColor: string;
	secondaryColor: string;
}

export class TimelineGraphic extends Timeline {
	constructor(
		title: string,
		period: HPeriod,
		events: HEvent[],
		public readonly theme: TimelineTheme,
		public isVisible: boolean = true
	) {
		super(title, period, events);
	}
}

export type TimelineGraphics = TimelineGraphic[];