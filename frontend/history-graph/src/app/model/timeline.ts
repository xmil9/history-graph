import { HPeriod } from "./historic-date";
import { HEvent } from "./historic-event";

export class Timeline {
	constructor(
		public readonly period: HPeriod,
		public readonly events: HEvent[] = [],
	) {}

	get to() {
		return this.period.to;
	}

	get from() {
		return this.period.from;
	}
}