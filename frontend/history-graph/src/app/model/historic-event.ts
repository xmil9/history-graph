import { HDate } from "./historic-date";

export class HEvent {
	constructor(
		public when: HDate,
		public description: string,
		public until?: HDate,
	) {}
}