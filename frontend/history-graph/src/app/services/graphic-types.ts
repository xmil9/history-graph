import { Timeline } from "../model/timeline";
import { HEvent } from "../model/historic-event";
import { signal } from "@angular/core";

export interface TimelineTheme {
	primaryColor: string;
	secondaryColor: string;
}

// Data and graphic properties for the history graph.
// Not spacial positions, though. Those are managed by the layout data structures.
export class HgGraphic {
	private timelines_: TimelineGraphic[];
	get timelines(): TimelineGraphic[] {
		return this.timelines_;
	}

	constructor(timelines: TimelineGraphic[]) {
		this.timelines_ = timelines;
	}
}

// Timeline data plus graphic properties.
// Not spacial positions, though. Those are managed by the layout data structures.
export class TimelineGraphic {
	constructor(
		public readonly timeline: Timeline,
		public readonly theme: TimelineTheme,
		public readonly eventGraphics: EventGraphic[],
		public isVisible = signal<boolean>(true)
	) {
	}

	get to() {
		return this.timeline.to;
	}

	get from() {
		return this.timeline.from;
	}

	get duration() {
		return this.timeline.duration;
	}
}

// Event data plus graphic properties.
// Not spacial positions, though. Those are managed by the layout data structures.
export class EventGraphic {
	constructor(
		public readonly hEvent: HEvent,
		public readonly theme: TimelineTheme
	) {
	}

	equals(other: EventGraphic): boolean {
		return this.hEvent.equals(other.hEvent);
	}
}