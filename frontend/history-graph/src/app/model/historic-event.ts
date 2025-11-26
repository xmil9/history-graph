import { duration, HDate, HDuration, HPeriod } from "./historic-date";

export class HEvent {
	readonly when: HDate;
	readonly until?: HDate;
	readonly label: string;
	readonly description?: string;

	get isPeriod(): boolean {
		return this.until !== undefined;
	}
	get period(): HPeriod | undefined {
		return this.isPeriod ? new HPeriod(this.when, this.until!) : undefined;
	}
	get duration(): HDuration {
		return this.isPeriod ? duration(this.when, this.until!) : 0;
	}

	constructor(when: HDate, label: string, description?: string);
	constructor(period: HPeriod, label: string, description?: string);
	constructor(time: HDate | HPeriod, label: string, description?: string) {
		this.when = time instanceof HDate ? time : time.from;
		this.until = time instanceof HPeriod ? time.to : undefined;
		this.label = label;
		this.description = description;
	}
}