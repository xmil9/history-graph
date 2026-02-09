import { duration, HDate, HDuration, HPeriod } from "./historic-date";

export class HEvent {
	readonly when: HDate;
	readonly until?: HDate;
	readonly label: string;
	readonly description?: string;
	readonly timelineId: number;
	readonly eventIdx: number;

	get isPeriod(): boolean {
		return this.until !== undefined;
	}
	get period(): HPeriod | undefined {
		return this.isPeriod ? new HPeriod(this.when, this.until!) : undefined;
	}
	get duration(): HDuration {
		return this.isPeriod ? duration(this.when, this.until!) : 0;
	}

	constructor(when: HDate, label: string, timelineId: number, eventIdx: number, description?: string);
	constructor(period: HPeriod, label: string, timelineId: number, eventIdx: number, description?: string);
	constructor(time: HDate | HPeriod, label: string, timelineId: number, eventIdx: number, description?: string) {
		this.when = time instanceof HDate ? time : time.from;
		this.until = time instanceof HPeriod ? time.to : undefined;
		this.label = label;
		this.description = description;
		this.timelineId = timelineId;
		this.eventIdx = eventIdx;
	}

	equalStartDate(other: HEvent): boolean {
		return this.when.equals(other.when);
	}

	less(other: HEvent): boolean {
		return this.when.less(other.when);
	}

	lessEqual(other: HEvent): boolean {
		if (this.equalStartDate(other))
			return true;
		return this.less(other);
	}

	greater(other: HEvent): boolean {
		return !this.lessEqual(other);
	}

	greaterEqual(other: HEvent): boolean {
		return !this.less(other);
	}
}